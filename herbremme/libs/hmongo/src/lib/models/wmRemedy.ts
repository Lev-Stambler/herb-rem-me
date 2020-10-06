import {
  createSchema,
  Type,
  typedModel,
  ExtractDoc,
  ExtractProps,
} from 'ts-mongoose';
import { EfficacyEnum } from '@herbremme/interfaces'

const WMUseSchema = createSchema({
  use: Type.string({ required: true, }),
  efficacy: Type.string({ required: true, enum: EfficacyEnum })
});

export const WMRemedySchema = createSchema({
  mainName: Type.string({ required: true }),
  otherNames: Type.array({ required: true }).of(Type.string()),
  uses: Type.array({ required: true }).of(
    Type.ref(Type.objectId()).to('wmuse', WMUseSchema)
  ),
  initName: Type.string({ required: true })
});

export const WMRemedy = typedModel('wmremedy', WMRemedySchema);
export type WMRemedyDoc = ExtractDoc<typeof WMRemedySchema>;
export type WMRemedyProps = ExtractProps<typeof WMRemedySchema>;

export const WMUse = typedModel('wmuse', WMUseSchema)
export type WMUseDoc = ExtractDoc<typeof WMUseSchema>;
export type WMUseProps = ExtractProps<typeof WMUseSchema>;
