import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[0-9]/, 'Include a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const creatorRequestSchema = z.object({
  purpose: z.string().min(20, 'Describe your purpose (min 20 chars)'),
  organization: z.string().min(2, 'Organization is required'),
  contactEmail: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Valid phone required'),
  identityDetails: z.string().min(10, 'Provide identity details'),
})

export const electionSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(20, 'Description min 20 characters'),
  category: z.string().min(1, 'Select a category'),
  startDate: z.string().min(1, 'Election start date is required'),
  endDate: z.string().min(1, 'Election end date is required'),
  registrationDeadline: z.string().min(1, 'Registration deadline is required'),
  maxVoters: z.number().min(1).max(1000000),
})

export const candidateSchema = z.object({
  name: z.string().min(2),
  designation: z.string().optional(),
  manifesto: z.string().optional(),
})

export const voteSchema = z.object({
  secretId: z.string().min(5, 'Enter your secret voter ID'),
  candidateId: z.string().uuid('Select a candidate'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type CreatorRequestInput = z.infer<typeof creatorRequestSchema>
export type ElectionInput = z.infer<typeof electionSchema>
export type CandidateInput = z.infer<typeof candidateSchema>
