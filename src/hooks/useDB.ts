import { useContext } from "react";
import { DBContext } from "../providers/db/DBProvider";

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error("useDB must be used within <DBProvider>");
  return ctx;
}
