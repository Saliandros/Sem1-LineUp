import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // Public routes
  layout("./routes/layouts/PublicLayout.jsx", [
    route("get-started", "./routes/auth/GetStarted.jsx"),
    route("login", "./routes/auth/Login.jsx"),
    route("register", "./routes/auth/Register.jsx"),
  ]),

  // Protected routes with navigation
  layout("./routes/layouts/ProtectedLayout.jsx", [
    layout("./routes/layouts/Root.jsx", [
      index("./routes/core/Home.jsx"),
      route("profile", "./routes/profiles/Profile.jsx"),
      route("profile/:userId", "./routes/profiles/Profile.jsx", { id: "user-profile" }),
      route("notes", "./routes/features/Notes.jsx"),
      route("edit-profile", "./routes/profiles/EditProfile.jsx"),
      route("collabs", "./routes/core/Services.jsx"),
      route("create", "./routes/posts/Create.jsx", [
        index("./routes/posts/create/IndexRedirect.jsx"),
        route("note", "./components/postCreation/NoteEditor.jsx"),
        route("request", "./components/postCreation/RequestEditor.jsx"),
      ]),
      route("chat", "./routes/chat/ChatList.jsx"),
      route("chat/new", "./routes/chat/NewChatPage.jsx"),
      route("chat/group", "./routes/chat/GroupChatPage.jsx"),
      route("chat/:threadId", "./routes/chat/OneToOneChatPage.jsx"),
    ]),
  ]),
] satisfies RouteConfig;
