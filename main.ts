import * as fs from "fs";
import { JassType, JassFunction, JassConstant, jParameterRegex, jFunctionRegex, jConstantRegex, JassParameter, jTypeRegex, JassEntry, JassCoreTypes, mapJasstoTsType } from "./jass_types";
import { combineComments, groupBy, createDoccomment } from "./util";

const jCommon = fs.readFileSync("common.j").toString();

const typeMatches = [...jCommon.matchAll(jTypeRegex)];

const parsedTypes = typeMatches.map(match => {
    return {
        identifier: match.groups["name"],
        parent: match.groups["parent"],
        description: combineComments(match.groups["pre_comment"], match.groups["post_comment"]),
    } as JassType;
});

parsedTypes.unshift({identifier: "handle", description: ""});

const functionMatches = [...jCommon.matchAll(jFunctionRegex)];

const parsedFunctions = functionMatches.map(match => {
    return {
        constant: match.groups["constant"] !== undefined,
        parameters: [...match.groups["parameters"].matchAll(jParameterRegex)].map(paramMatch => ({identifier: paramMatch.groups["name"], type: paramMatch.groups["type"]} as JassParameter)),
        identifier: match.groups["name"],
        returnType: match.groups["return_type"],
        description: combineComments(match.groups["pre_comment"], match.groups["post_comment"]),
    } as JassFunction;
});

const constantMatches = [...jCommon.matchAll(jConstantRegex)];

const parsedConstants = constantMatches.map(match => {
    return {
        identifier: match.groups["name"],
        value: match.groups["value"],
        type: match.groups["type"],
        description: combineComments(match.groups["pre_comment"], match.groups["post_comment"]),
    } as JassConstant;
});

// Database
const database: Record<string, JassEntry> = {};
parsedTypes.forEach(e => database[e.identifier] = e);
parsedFunctions.forEach(e => database[e.identifier] = e);
parsedConstants.forEach(e => database[e.identifier] = e);

// TODO inject docs from markdown files
// TODO variable support (blizzard.j)

// Generate enums
const constantGroups = groupBy(parsedConstants, "type");

let enumString: string = "";

for (const constantType in constantGroups) {
    if (constantGroups.hasOwnProperty(constantType)) {
        const isCoreType = JassCoreTypes.includes(constantType);
        const constantGroup = constantGroups[constantType];

        if (isCoreType) {
            const constantMembers = constantGroup.reduce((prev, curr) => {
                return `${prev}\ndeclare const ${curr.identifier}: ${mapJasstoTsType(constantType)}; // ${curr.value}`;
            }, "");
            enumString += `\n${constantMembers}`;
        } else {
            const constantMembers = constantGroup.reduce((prev, curr) => {
                return `${prev}\n    ${curr.identifier}, // ${curr.value}`;
            }, "");
            const docComment = createDoccomment(`${database[constantType].description}\n@membersOnly`);
            enumString += `\n${docComment}declare enum ${constantType} {${constantMembers} \n}`;
        }
    }
}

// Generate interfaces
let typeString: string = "";

parsedTypes.forEach(type => {
    if (!constantGroups[type.identifier]) {
        const typeParent = type.parent ? ` extends ${type.parent}` : "";
        typeString += `\ndeclare interface ${type.identifier}${typeParent} { __${type.identifier}: never; }`
    }
});

let functionString: string = "";

// Generate functions
parsedFunctions.forEach(func => {
    const parameters = func.parameters.map(parameter => `${parameter.identifier}: ${mapJasstoTsType(parameter.type)}`).join(", ");
    const docComment = createDoccomment(func.description);
    const returnType = mapJasstoTsType(func.returnType);
    functionString += `\n${docComment}declare function ${func.identifier}(${parameters}): ${returnType};`;
});

fs.writeFileSync("common.d.ts", typeString + enumString + functionString);