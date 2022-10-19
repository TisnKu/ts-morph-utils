import {
  IContentSharingService,
  ISharingSession,
} from "./contentSharingService.interface";
import { ContentSharingError } from "./contentSharingService";

export class A extends ContentSharingError {}

export class B implements ISharingSession {}
export class C implements IContentSharingService {}
