import { Role } from '@prisma/client';
import { Strategy } from 'passport-jwt';
type JwtPayload = {
    sub: number;
    role: Role;
};
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): {
        userId: number;
        role: import("@prisma/client").$Enums.Role;
    };
}
export {};
