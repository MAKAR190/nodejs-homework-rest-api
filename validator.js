const yup = require("yup");
const createContactSchema = yup.object().shape({
  name: yup.string().required({ message: "missing required name field" }),
  email: yup
    .string()
    .email()
    .required({ message: "missing required name field" }),
  phone: yup.string().required({ message: "missing required name field" }),
  favorite: yup.boolean().default(false),
});
const putContactSchema = yup.object().shape({
  name: yup.string(),
  email: yup.string().email(),
  phone: yup.string(),
  favorite: yup.boolean().default(false),
});
const patchFavoriteSchema = yup.object().shape({
  favorite: yup.boolean().required("Missing Field Favorite"),
});
const verifyEmailSchema = yup.object().shape({
  email: yup.string().email().required("Missing Field Email"),
});
const patchSubscriptionSchema = yup.object().shape({
  subscription: yup
    .string()
    .oneOf(["starter", "pro", "business"])
    .required("Missing Field subscripion"),
});
const registerSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});
const validatePost = () => async (req, res, next) => {
  try {
    await createContactSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json(error.message);
  }
};
const validatePut = () => async (req, res, next) => {
  try {
    await putContactSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json(error.message);
  }
};
const validateFavorite = () => async (req, res, next) => {
  try {
    await patchFavoriteSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json(error.message);
  }
};
const validateSubscription = () => async (req, res, next) => {
  try {
    await patchSubscriptionSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json(error.message);
  }
};
const registerValidation = () => async (req, res, next) => {
  try {
    await registerSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json(error.message);
  }
};
const emailValidation = () => async (req, res, next) => {
  try {
    await verifyEmailSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json(error.message);
  }
};
module.exports = {
  validatePost,
  validatePut,
  validateFavorite,
  registerValidation,
  validateSubscription,
  emailValidation
};
