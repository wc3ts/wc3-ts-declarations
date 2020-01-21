export const jTypeRegex = /(?<pre_comment>(?:\/\/.*\s+)+)?type\s+(?<name>\w+)\s+extends\s+(?<parent>\w+)(?<post_comment>[^\S\r\n]+\/\/.*)?/g
export const jFunctionRegex = /(?<pre_comment>(?:\/\/.*\s+)+)?(?<constant>constant)?\s+native\s+(?<name>\w+)\s+takes\s+(?<parameters>.+)returns\s+(?<return_type>\w+)(?<post_comment>[^\S\r\n]+\/\/.*)?/g
export const jParameterRegex = /((?<type>\w+) (?<name>\w+))/g
export const jConstantRegex = /(?<pre_comment>(?:\/\/.*\s+)+)?constant\s+(?<type>\w+)\s+(?<name>\w+)\s+=\s+(?<value>[\w()''""]+)(?<post_comment>[^\S\r\n]+\/\/.*)?/g

export interface JassEntry {
    description: string,
    identifier: string,
}

export interface JassType extends JassEntry {
    parent?: string
}

export interface JassParameter {
    identifier: string,
    type: string
}

export interface JassFunction extends JassEntry  {
    constant: boolean,
    parameters: Array<JassParameter>,
    returnType: string
}

export interface JassConstant extends JassEntry {
    type: string,
    value: string
}

export const JassCoreTypes = ["boolean", "real", "integer", "string"];

export function mapJasstoTsType(type: string) {
    const typeMap = {
        nothing: "void",
        integer: "number",
        real: "number",
        code: "() => void"
    }
    return typeMap[type] ? typeMap[type] : type
}