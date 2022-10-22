import { getRelativePath } from "./file";

describe("File", () => {
  it("should return ./b given /generated/a.ts and /generated/b.ts", () => {
    expect(getRelativePath("/generated/a.ts", "/generated/b.ts")).toEqual(
      "./b"
    );
  });

  it("should return ../b given /generated/a.ts and /b.ts", () => {
    expect(getRelativePath("/generated/a.ts", "/b.ts")).toEqual("../b");
  });

  it("should return ./x/b given /generated/a.ts and /generated/x/b.ts", () => {
    expect(getRelativePath("/generated/a.ts", "/generated/x/b.ts")).toEqual(
      "./x/b"
    );
  });
});
