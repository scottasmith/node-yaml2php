import * as YAML from 'yaml-ast-parser';
import { readFileSync, read } from 'fs';

class PhpStringVisitor {
    private _pretty: boolean;
    private _indent: number;
    private _currentIndent = 0;

    constructor(pretty = false, indent = 4) {
        this._pretty = pretty;
        this._indent = indent;
    }

    public accept(node: YAML.YAMLNode): string {
        let value = '';

        switch (node.kind) {
            case YAML.Kind.SCALAR: {
                value = this.visitScalar(<YAML.YAMLScalar>node);
                break;
            }
            case YAML.Kind.MAP: {
                this._currentIndent++;
                value = 'array(' + this.visitMap(<YAML.YamlMap>node);
                this._currentIndent--;
                value += this._returnPretty(')');
                break;
            }
            case YAML.Kind.MAPPING: {
                value = this._returnPretty(this.visitMapping(<YAML.YAMLMapping>node));
                break;
            }
            case YAML.Kind.SEQ: {
                this._currentIndent++;
                value = 'array(' + this.visitSequence(<YAML.YAMLSequence>node);
                this._currentIndent--;
                value += this._returnPretty(')');
                break;
            }
        }

        return value;
    }

    private visitScalar(node: YAML.YAMLScalar, wrapString = false): string {
        let nodeType = YAML.determineScalarType(node);

        if (YAML.ScalarType.string == nodeType) {
            return this.formatString(`"${node.value}"`);
        } else if (YAML.ScalarType.bool == nodeType) {
            return String(YAML.parseYamlBoolean(node.value));
        } else if (YAML.ScalarType.float == nodeType) {
            return String(YAML.parseYamlFloat(node.value));
        } else if (YAML.ScalarType.int == nodeType) {
            return String(YAML.parseYamlInteger(node.value));
        } else if (YAML.ScalarType.null == nodeType) {
            return "null";
        } else {
            return "null";
        }
    }

    private formatString(value: string): string {
        let firstQuote = value[0];
        let lastQuote = value[value.length - 1];
        let retValue: string;

        if (firstQuote == lastQuote
            && ('"' == firstQuote || "'" == firstQuote)
        ) {
            retValue = value.substring(1, value.length - 1);
        }

        let regExpResponse = /^%PHP{(.*)}$/.exec(retValue);
        if (regExpResponse) {
            return regExpResponse[1];
        }

        if (retValue.indexOf("'")) {
            retValue = "'" + retValue.replace(/[']/g, "\\'") + "'";
        } else if (retValue.indexOf('"')) {
            retValue = '"' + retValue.replace(/["]/g, '\\"') + '"';
        }

        return retValue;
    }

    private visitMapping(node: YAML.YAMLMapping): string {
        let key = this.visitScalar(node.key);
        let value = this.accept(node.value);

        return `${key} => ${value}`;
    }

    private visitSequence(node: YAML.YAMLSequence): string {
        let sequences = [];
        node.items.forEach((node: YAML.YAMLNode) => {
            sequences.push(this._returnPretty(this.accept(node), true));
        });

        return sequences.join(', ');
    }

    private visitMap(node: YAML.YamlMap): string {
        let maps = [];
        node.mappings.forEach((node: YAML.YAMLNode) => {
            if ('<<' != this.visitScalar(node.key)) {
                maps.push(this.accept(node));
            }
        });

        return maps.join(', ');
    }

    private _returnPretty(value: string, newLine = true): string {
        if (this._pretty) {
            return (true == newLine ? '\n' : '') + Array((this._currentIndent * this._indent) + 1).join(" ") + value;
        }

        return value;
    }
}

export function fromFile(filename: string, pretty = false, indent = 4) {
    let doc = YAML.load(readFileSync(filename).toString());

    if (doc) {
        let visitor = new PhpStringVisitor(pretty, indent)
        return `<?php\nreturn ${visitor.accept(doc)};`;
    }

    return `<?php\nreturn array();`;
}

export function fromString(value: string, pretty = false, indent = 4) {
    let doc = YAML.load(value);

    if (doc) {
        let visitor = new PhpStringVisitor(pretty, indent)
        return `<?php\nreturn ${visitor.accept(doc)};`;
    }

    return `<?php\nreturn array();`;
}
