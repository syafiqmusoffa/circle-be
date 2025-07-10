import Joi from "joi";

export const profileSchema = Joi.object({
  username: Joi.string().allow("").optional().trim().min(5).pattern(/^\S+$/).messages({
    "string.pattern.base": "Username harus 1 kata tanpa spasi",
    "string.min": "Username minimal 5 huruf",
  }),
  name: Joi.string().allow("").optional(),
  bio: Joi.string().allow("").optional(),
  avatarDeleted: Joi.string().optional(),
  bannerDeleted: Joi.string().optional(),
});
