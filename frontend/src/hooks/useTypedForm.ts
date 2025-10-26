import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { 
  loginSchema, 
  registerSchema, 
  createTaskSchema, 
  updateTaskSchema,
  LoginFormData,
  RegisterFormData,
  CreateTaskFormData,
  UpdateTaskFormData
} from '@/lib/validations';

// Generic typed form hook
export function useTypedForm<T extends FieldValues>(
  schema: ZodSchema<T>,
  defaultValues?: DefaultValues<T>
): UseFormReturn<T> & {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
} {
  const form = useForm<T>({
    resolver: zodResolver(schema as any), // ✅ cast to any to satisfy TS
    defaultValues: defaultValues || {} as DefaultValues<T>,
    mode: 'onChange',
  });

  const { formState } = form;

  return {
    ...form,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
  };
}

// Specific form hooks
export function useLoginForm(defaultValues?: DefaultValues<LoginFormData>) {
  return useTypedForm<LoginFormData>(loginSchema, defaultValues);
}

export function useRegisterForm(defaultValues?: DefaultValues<RegisterFormData>) {
  return useTypedForm<RegisterFormData>(registerSchema, defaultValues);
}

export function useCreateTaskForm(defaultValues?: DefaultValues<CreateTaskFormData>) {
  return useTypedForm<CreateTaskFormData>(createTaskSchema, defaultValues);
}

export function useUpdateTaskForm(defaultValues?: DefaultValues<UpdateTaskFormData>) {
  return useTypedForm<UpdateTaskFormData>(updateTaskSchema, defaultValues);
}
