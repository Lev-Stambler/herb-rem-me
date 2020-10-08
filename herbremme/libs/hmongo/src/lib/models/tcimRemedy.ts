import {
  createSchema,
  Type,
  typedModel,
  ExtractDoc,
  ExtractProps,
} from 'ts-mongoose';
import { EfficacyEnum } from '@herbremme/interfaces'

const TCIMUseSchema = createSchema({
  use: Type.string({ required: true, unique: true }),
});

export const TCIMRemedySchema = createSchema({
  englishName: Type.string(),
  chineseName: Type.string({ required: true }),
  uses: Type.array({ required: true }).of(
    Type.ref(Type.objectId()).to('tcimUse', TCIMUseSchema)
  ),
});

export const TCIMRemedy = typedModel('tcimRemedy', TCIMRemedySchema);
export type TCIMRemedyDoc = ExtractDoc<typeof TCIMRemedySchema>;
export type TCIMRemedyProps = ExtractProps<typeof TCIMRemedySchema>;

export const TCIMUse = typedModel('tcimUse', TCIMUseSchema)
export type TCIMUseDoc = ExtractDoc<typeof TCIMUseSchema>;
export type TCIMUseProps = ExtractProps<typeof TCIMUseSchema>;
