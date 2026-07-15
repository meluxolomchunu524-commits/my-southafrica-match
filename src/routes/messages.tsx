import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — LoveConnect SA" },
      { name: "description", content: "Chat privately and safely with your matches on LoveConnect SA." },
    ],
  }),
  component: () => <Outlet />,
});
