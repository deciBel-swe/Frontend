"use client";

import { SidebarUserCard } from "./SidebarUserCard";

type Props = React.ComponentProps<typeof SidebarUserCard>;

export function SidebarUserCardContainer(props: Props) {
  // const [isFollowing, setIsFollowing] = useState(props.isFollowing ?? false);

  // const handleFollowToggle = () => {
  //   setIsFollowing((prev) => !prev);
  //   console.log("toggle follow");
  // };

  return (
    <SidebarUserCard
      {...props}
      // isFollowing={isFollowing}
      // onFollowToggle={handleFollowToggle}
    />
  );
}