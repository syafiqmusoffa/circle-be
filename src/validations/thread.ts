import Joi from "joi";

export const newThread = Joi.object({
  content: Joi.string().allow(null, ""),
  imageUrl: Joi.string().allow(null, ""),
}).custom((value, helpers) => {
  const hasContent = value.content && value.content.trim() !== "";
  const hasImage = value.imageUrl && value.imageUrl.trim() !== "";

  if (!hasContent && !hasImage) {
    return helpers.error("any.invalid", {
      message: "Minimal salah satu: content atau imageUrl harus diisi",
    });
  }

  return value;
});
