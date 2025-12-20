import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // Public routes
  layout("./routes/PublicLayout.jsx", [
    route("get-started", "./routes/GetStarted.jsx"),
    route("login", "./routes/Login.jsx"),
    route("register", "./routes/Register.jsx"),
  ]),

  // Protected routes with navigation
  layout("./routes/ProtectedLayout.jsx", [
    layout("./routes/Root.jsx", [
      index("./routes/Home.jsx"),
      route("profile", "./routes/Profile.jsx"),
      route("notes", "./routes/Notes.jsx"),
      route("edit-profile", "./routes/EditProfile.jsx"),
      route("collabs", "./routes/Services.jsx"),
      route("create", "./routes/Create.jsx", [
        index("./routes/create/IndexRedirect.jsx"),
        route("note", "./components/postCreation/NoteEditor.jsx"),
        route("story", "./components/postCreation/StoryEditor.jsx"),
        route("request", "./components/postCreation/RequestEditor.jsx"),
      ]),
      route("chat", "./routes/ChatList.jsx"),
      route("chat/new", "./routes/NewChatPage.jsx"),
      route("chat/group", "./routes/GroupChatPage.jsx"),
      route("chat/:threadId", "./routes/OneToOneChatPage.jsx"),
    ]),
  ]),
] satisfies RouteConfig;
