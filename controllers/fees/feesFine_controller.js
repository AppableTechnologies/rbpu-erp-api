const {
  StatusTypes,
  FeesDiscounts,
  FeesDiscountsStatusTypes,
  FeesTypes,
  FeesCategoryFeesDiscount,
} = require("../../models");
const { pgPool } = require("../../pg_constant");
const { Op } = require("sequelize");

module.exports={
    getFeesFines:async(req,res)=>{},
    createFeesFine:async(req,res)=>{},
    updateFeesFine:async(req,res)=>{},
    deleteFeesFine:async(req,res)=>{}
}
