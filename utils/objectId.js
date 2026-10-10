import { ObjectId } from "mongodb";

export function isValidObjectId(value) {
  return typeof value === "string" && ObjectId.isValid(value) && String(new ObjectId(value)) === value;
}

export function toObjectId(value) {
  return new ObjectId(value);
}