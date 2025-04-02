import { PlanType } from "@auth/enums/plans-user.enum";

export class Plan {

    id              : string;
    name            : string;
    maxUsers        : number;
    maxAttributes   : number;
    monthlyPrice    : number;
    yearlyPrice     : number;
    discount        : number;
    discountType    : PlanType;
    version         : number;
    createdAt       : Date;
    updatedAt       : Date;

}