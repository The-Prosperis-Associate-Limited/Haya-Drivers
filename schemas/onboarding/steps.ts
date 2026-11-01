import z from "zod";

const phoneField = z
  .string()
  .trim()
  .regex(
    /^\+[1-9]\d{7,14}$/,
    "Enter the number in international format, e.g. +2348012345678",
  );

const ninField = z
  .string()
  .trim()
  .regex(/^\d{11}$/, "A NIN is 11 digits");

export const personalInformationSchema = z.object({
  phone_no: phoneField,
  gender: z.enum(["MALE", "FEMALE"], {
    message: "Select your gender",
  }),
  marital_status: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], {
    message: "Select your marital status",
  }),
  date_of_birth: z.string().min(1, "Select your date of birth"),
  country: z.string().min(1, "Select the country you reside in"),
  state_of_residence: z.string().min(1, "Select where you reside"),
  state_of_origin: z.string().min(1, "Select your state of origin"),
});

export const experienceSchema = z.object({
  years_of_experience: z.coerce
    .number<number>()
    .int()
    .min(0, "Select your years of experience")
    .max(60, "That looks too high"),
  driver_type: z.enum(
    [
      "CORPORATE_DRIVER",
      "PRIVATE_DRIVER",
      "LOGISTICS_DRIVER",
      "RIDE_HAILING_DRIVER",
      "HEAVY_DUTY_DRIVER",
    ],
    { message: "Select a driver type" },
  ),
  transmission: z.enum(["AUTOMATIC", "MANUAL", "BOTH"], {
    message: "Select what transmission you can drive",
  }),
  licence_classes: z
    .array(z.string())
    .min(1, "Select at least one licence class"),
  license_number: z.string().trim().min(4, "Enter your driver licence number"),
  license_expires_at: z.string().min(1, "Select your licence expiry date"),
  expected_monthly_rate: z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter your monthly rate in naira, digits only")
    .refine((value) => Number(value) > 0, "Enter what you expect to earn"),
  day_range: z.string().min(1, "Pick the days you work"),
  work_start: z.string().min(1, "Set a start time"),
  work_end: z.string().min(1, "Set a finish time"),
});

export const academicQualificationSchema = z.object({
  academic_level: z.enum(
    ["NONE", "PRIMARY", "SECONDARY", "OND", "HND", "BSC", "MSC", "PHD"],
    { message: "Select your academic level" },
  ),
  institution: z.string().trim().optional(),
  course_of_study: z.string().trim().optional(),
});

export const workExperienceSchema = z.object({
  experiences: z
    .array(
      z
        .object({
          employer: z.string().trim().min(1, "Enter the employer"),
          job_title: z.string().trim().min(1, "Enter the job title"),
          started_at: z.string().min(1, "Select a start date"),
          ended_at: z.string().optional(),
          is_current: z.boolean().optional(),
        })
        .refine(
          (entry) =>
            entry.is_current ||
            !entry.ended_at ||
            new Date(entry.ended_at) >= new Date(entry.started_at),
          {
            message: "The end date cannot come before the start date",
            path: ["ended_at"],
          },
        ),
    )
    .min(1, "Add at least one role"),
});

// One previous-employer reference and exactly one guarantor - the guarantor
// must be a working professional, never a family member or friend.
export const guarantorSchema = z.object({
  reference: z.object({
    full_name: z.string().trim().min(2, "Enter your reference's name"),
    company_name: z.string().trim().optional(),
    phone_no: phoneField,
  }),
  guarantors: z
    .array(
      z.object({
        full_name: z.string().trim().min(2, "Enter your guarantor's name"),
        relationship: z.enum(
          [
            "FORMER_EMPLOYER",
            "COLLEAGUE",
            "RELIGIOUS_LEADER",
            "COMMUNITY_LEADER",
            "OTHER",
          ],
          { message: "Select who this person is to you" },
        ),
        phone_no: phoneField,
        address: z.string().trim().min(5, "Enter your guarantor's address"),
        nin: ninField,
      }),
    )
    .length(1, "Provide exactly one guarantor"),
});

export const additionalInformationSchema = z.object({
  language_count: z.coerce.number<number>().int().min(0).max(20).optional(),
  languages: z.array(z.string()).optional(),
  religion: z.string().trim().optional(),
  ethnicity: z.string().trim().optional(),
});

export type PersonalInformationFormValues = z.infer<
  typeof personalInformationSchema
>;
export type ExperienceFormValues = z.infer<typeof experienceSchema>;
export type AcademicQualificationFormValues = z.infer<
  typeof academicQualificationSchema
>;
export type WorkExperienceFormValues = z.infer<typeof workExperienceSchema>;
export type GuarantorFormValues = z.infer<typeof guarantorSchema>;
export type AdditionalInformationFormValues = z.infer<
  typeof additionalInformationSchema
>;
