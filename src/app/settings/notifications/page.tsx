"use client";

import Checkbox from "@/components/buttons/CheckBox";

const activities = [
  { id: "follower", label: "New follower" },
  { id: "repost", label: "Repost of your post" },
  { id: "likes", label: "Likes on your post" },
  { id: "comment", label: "Comment on your post" },
  { id: "message", label: "New message" },
];

export default function Page() {
  return (
    <div className="p-6 text-text-primary">
      <h2 className="text-xl font-bold mb-4">Activities</h2>
      <p className="text-md font-semibold mb-8">Get notified by:</p>
      <ul className="space-y-3">
        {activities.map((activity) => (
          <li key={activity.id}>
            <Checkbox id={activity.id} label={activity.label} />
          </li>
        ))}
      </ul>
    </div>
  );
}
