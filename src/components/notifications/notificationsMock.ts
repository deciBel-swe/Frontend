import { Notification } from "@/components/notifications/types/notification";

export const notificationsMock: Notification[] = [
  {
    id: "1",
    type: "repost",
    actor: {
      id: "u1",
      username: "Ahmed10salah222",
      avatarUrl: "https://a1.sndcdn.com/images/default_avatar_large.png",
    },
    targetTitle: "Related tracks: Aqua Mania",
    targetUrl: "/playlist/aqua-mania",
    createdAt: "2 days ago",
  },
  {
    id: "2",
    type: "like",
    actor: {
      id: "u1",
      username: "Ahmed10salah222",
      avatarUrl: "https://a1.sndcdn.com/images/default_avatar_large.png",
    },
    targetTitle: "Related tracks: Aqua Mania",
    createdAt: "2 days ago",
  },
  {
    id: "3",
    type: "repost",
    actor: {
      id: "u1",
      username: "Ahmed10salah222",
      avatarUrl: "https://a1.sndcdn.com/images/default_avatar_large.png",
    },
    targetTitle: "test",
    createdAt: "2 days ago",
  },
  {
    id: "4",
    type: "like",
    actor: {
      id: "u1",
      username: "Jasmin Ahmed",
      avatarUrl: "https://a1.sndcdn.com/images/default_avatar_large.png",
    },
    targetTitle: "test",
    createdAt: "2 days ago",
  },
  {
    id: "5",
    type: "follow",
    actor: {
      id: "u1",
      username: "Ahmed10salah222",
      avatarUrl: "https://a1.sndcdn.com/images/default_avatar_large.png",
    },
    createdAt: "2 days ago",
  },
];