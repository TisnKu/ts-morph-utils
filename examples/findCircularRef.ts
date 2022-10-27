import { Project } from "ts-morph";

const project = new Project();
project.createSourceFile(
  "service.ts",
  `
export class Service {
}
`
);
project.createSourceFile(
  "service.interface.ts",
  `
import { Service } from "./service";
export interface IA {}

export class ClassB {
  public errorCode: string;
}

export class ClassC extends Service {

}
`
);
project.createSourceFile(
  "service.mock.ts",
  `
import {
  IA,
} from "./service.interface";
import { Service } from "./service";

export class ClassC extends Service {}
export class ClassA implements IA {}
`
);

const mockFile = project.getSourceFileOrThrow("service.mock.ts");
const serviceFile = project.getSourceFileOrThrow("service.ts");
const interfaceFile = project.getSourceFileOrThrow("service.interface.ts");

const classC = mockFile.getClassOrThrow("ClassC");
const classA = mockFile.getClassOrThrow("ClassA");
const classB = interfaceFile.getClassOrThrow("ClassB");
const interfaceA = interfaceFile.getInterfaceOrThrow("IA");
const serviceA = serviceFile.getClassOrThrow("Service");

console.log("class c refs");
classC.findReferencesAsNodes().forEach((ref) => {
  console.log(
    `${ref.getSourceFile().getFilePath()}:${ref.getStartLineNumber()}`
  );
});

console.log("class a refs");
classA.findReferencesAsNodes().forEach((ref) => {
  console.log(
    `${ref.getSourceFile().getFilePath()}:${ref.getStartLineNumber()}`
  );
});

console.log("class B refs");
classB.findReferencesAsNodes().forEach((ref) => {
  console.log(
    `${ref.getSourceFile().getFilePath()}:${ref.getStartLineNumber()}`
  );
});

console.log("interface A refs");
interfaceA.findReferencesAsNodes().forEach((ref) => {
  console.log(
    `${ref.getSourceFile().getFilePath()}:${ref.getStartLineNumber()}`
  );
});

console.log("Service A refs");
serviceA.findReferencesAsNodes().forEach((ref) => {
  console.log(
    `${ref.getSourceFile().getFilePath()}:${ref.getStartLineNumber()}`
  );
});
