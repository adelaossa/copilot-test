import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('JSON')
export class JSONScalar implements CustomScalar<any, any> {
  description = 'JSON custom scalar type';

  parseValue(value: any): any {
    return value;
  }

  serialize(value: any): any {
    return value;
  }

  parseLiteral(ast: ValueNode): any {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return ast.value;
    }
    if (ast.kind === Kind.OBJECT) {
      throw new Error('Not supported yet');
    }
    return null;
  }
}