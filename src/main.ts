import * as fs from 'fs';
import * as path from 'path';
import {
	JassType,
	JassFunction,
	JassVariable,
	jParameterRegex,
	jFunctionRegex,
	jVariableRegex,
	JassParameter,
	jTypeRegex,
	JassEntry,
	JassCoreTypes,
	mapJasstoTsType,
	JassEntryKind
} from './jass_types';
import {combineComments, groupBy, createDocComment, indentLines} from './util';

function parseTypes(input:string)
{
	const typeMatches = [...input.matchAll(jTypeRegex)];
	const parsedTypes = typeMatches.map(match =>
	{
		return {
			kind: JassEntryKind.JassType,
			identifier: match.groups['name'],
			parent: match.groups['parent'],
			description: combineComments(match.groups['pre_comment'], match.groups['post_comment'])
		} as JassType;
	});
	return parsedTypes;
}

function parseFunctions(input: string)
{
	const functionMatches = [...input.matchAll(jFunctionRegex)];
	const parsedFunctions = functionMatches.map(match =>
	{
		return {
			kind: JassEntryKind.JassFunction,
			isConstant: match.groups['constant'] !== undefined,
			parameters: [...match.groups['parameters'].matchAll(jParameterRegex)]
				.map(paramMatch => ({
					identifier: paramMatch.groups['name'],
					type: paramMatch.groups['type']
				} as JassParameter)),
			identifier: match.groups['name'],
			returnType: match.groups['return_type'],
			description: combineComments(match.groups['pre_comment'], match.groups['post_comment'])
		} as JassFunction;
	});
	return parsedFunctions;
}

function parseVariables(input: string)
{
	const constantMatches = [...input.matchAll(jVariableRegex)];
	const parsedConstants = constantMatches.map(match =>
	{
		return {
			kind: JassEntryKind.JassVariable,
			identifier: match.groups['name'],
			value: match.groups['value'],
			type: match.groups['type'],
			description: combineComments(match.groups['pre_comment'], match.groups['post_comment']),
			isArray: match.groups['array'] === 'array',
			isConstant: match.groups['constant'] === 'constant'
		} as JassVariable;
	});
	return parsedConstants;
}

// Database
const database: Record<string, JassEntry> = {};

let jCommon = fs.readFileSync('jass-api/common.j').toString();
let jBlizzard = fs.readFileSync('jass-api/Blizzard.j').toString();

const parsedFunctions = parseFunctions(jCommon).concat(parseFunctions(jBlizzard));
parsedFunctions.forEach(e => database[e.identifier] = e);

/*
 * Remove functions for variable and type parsing
 * TODO this is hacky remove (smarter regex or grammer)
 */
jCommon = jCommon.replace(/^\s*function(.|\s)*?endfunction(\n|$)/gm, '');
jBlizzard = jBlizzard.replace(/^\s*function(.|\s)*?endfunction(\n|$)/gm, '');

const parsedVariables = parseVariables(jCommon).concat(parseVariables(jBlizzard));
const parsedTypes = parseTypes(jCommon).concat(parseTypes(jBlizzard));
parsedTypes.forEach(e => database[e.identifier] = e);

parsedVariables.forEach(e => database[e.identifier] = e);

fs.readdirSync('api-extension/declarations').forEach(doc =>
{
	database[path.basename(doc, '.json')]
		= JSON.parse(fs.readFileSync(path.join('api-extension/declarations', doc)).toString());
});

fs.readdirSync('api-extension/docs').forEach(doc =>
{
	database[path.basename(doc, '.md')].description = fs.readFileSync(path.join('api-extension/docs', doc)).toString();
});

function createDocCommentForVariable(variable: JassVariable)
{
	return createDocComment(`${variable.description}\n@default ${variable.value}`);
}

const groupedDatabase = groupBy(Object.values(database), 'kind');

// Generate enums and constants
const constantGroups = groupBy((groupedDatabase[JassEntryKind.JassVariable] as JassVariable[])
	.filter(v => v.isConstant), 'type');

let enumString: string = '';

for (const constantType in constantGroups)
{
	if (constantGroups.hasOwnProperty(constantType))
	{
		const isCoreType = JassCoreTypes.includes(constantType);
		const constantGroup = constantGroups[constantType];

		if (isCoreType)
		{
			const constantMembers = constantGroup.reduce((prev, curr) =>
			{
				const docComment = createDocCommentForVariable(curr);
				return `${prev}\n\n${docComment}declare const ${curr.identifier}: ${mapJasstoTsType(constantType)};`;
			}, '');
			enumString += `\n${constantMembers}`;
		}
		else
		{
			const constantMembers = constantGroup.reduce((prev, curr) =>
			{
				const docComment = createDocCommentForVariable(curr);
				const member = indentLines(`${docComment}${curr.identifier},`, 1);
				return `${prev}\n\n${member}`;
			}, '');
			const docComment = createDocComment(`${database[constantType].description}\n@compileMembersOnly`);
			enumString += `\n\n${docComment}declare enum ${constantType} {${constantMembers} \n}`;
		}
	}
}

// Generate variables
let varrableString: string = '';

(groupedDatabase[JassEntryKind.JassVariable] as JassVariable[]).filter(v => !v.isConstant).forEach(variable =>
{
	let type = mapJasstoTsType(variable.type);
	if (variable.isArray)
	{
		type = `Array<${type}>`;
	}
	const docComment = createDocCommentForVariable(variable);
	varrableString += `\n\n${docComment}declare var ${variable.identifier}: ${type}; // ${variable.value}`;
});

// Generate interfaces
let typeString: string = '';

(groupedDatabase[JassEntryKind.JassType] as JassType[]).forEach(type =>
{
	if (!constantGroups[type.identifier])
	{
		const typeParent = type.parent ? ` extends ${type.parent}` : '';
		const docComment = createDocComment(`${type.description}`);
		typeString +=
            `\n\n${docComment}declare interface ${type.identifier}${typeParent} { __${type.identifier}: never; }`;
	}
});

let functionString: string = '';

// Generate functions
(groupedDatabase[JassEntryKind.JassFunction] as JassFunction[]).forEach(func =>
{
	const parameters = func.parameters
		.map(parameter => `${parameter.identifier}: ${mapJasstoTsType(parameter.type)}`)
		.join(', ');
	const docComment = createDocComment(func.description);
	const returnType = mapJasstoTsType(func.returnType);
	functionString += `\n\n${docComment}declare function ${func.identifier}(${parameters}): ${returnType};`;
});

if (!fs.existsSync('dist'))
{
	fs.mkdirSync('dist');
}

// TODO move this to a file
const declarationHeader = `/** @noSelfInFile */

/**
 * @luaTable
 * 
 * LuaTable is similar to typescripts \`Record<K, V>\`.
 * LuaTable instances are treated like a native Lua table.
 * This can be used to avoid the overhead of \`Map<K, V>\` and \`Set<T>\`.
 * 
 * For more information:
 * 
 * @see https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Compiler-Annotations#luaTable
 * 
*/
declare class LuaTable<K extends {} = {}, V = any> {
    readonly length: number;
    set(key: K, value: V | undefined): void;
    get(key: K): V | undefined;
}`;

fs.writeFileSync('dist/wc3.d.ts', declarationHeader + typeString + enumString + varrableString + functionString);
