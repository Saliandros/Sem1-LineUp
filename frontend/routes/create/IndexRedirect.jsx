import { redirect } from "react-router-dom";

export function loader() {
  // redirect /create -> /create/note
  throw redirect("/create/note");
}

export default function IndexRedirect() {
  return null;
}
