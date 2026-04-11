# general notes:
    differ between showing on-auth/no-auth && my-profile/not-my-profile

    page header: make array of actions (choose from them by a prop instead of posted text)
    duration handling(as take care the duration formatting became 13113213 s instead of 5:02:01)

    make genre a separate component

    everything we do make a small documentation of the props taken for each component and the data flow across components (make the biggest component request the data passes it untill the smallest one preview all of the data)

    if shown on authorized or takes time to load data (glitchy): wrapp with fallback, suspense!!!!!!!!!!
    if not working well in takes time to load data -> use suspense with fallback, dynamic rendering

# Playlist:
    implement the TODOs
    delete akmal files after ensuring they are not used (delete setId)

# Messages&&Notifications:
    make a generic component (modal) like the one in the queue in the player
        divide dropdown into:
        1- header <h1>{header}</h1>
        2- call InboxList/NotificationList
        3- link "View all messages"/"View all notifications"

# Messages:
    messageWapper component will be a wrapper around message content
        divide page into:
        1- sidebar
        2- upper (nav) div (header)
        3- main
    components:
        1- sidebar: upper div content -> <h1>Messages</h1> + button
                    add a new folder "inbox" inside features/messages contains-> new component "InboxList" that is a list of new component "InboxItem"
        2- will not do report, header: block already done (no modal) && remaining: link(sender dispalname), mark as read/unread button
        3- use content in repost page, search, feed, message: contain needed playlist+track list. there (in the dto will be a flag)
           new component "List": take props trackid, playlistiduser, user (optionals), type     if track ? return Trackcard : return playlistCard
           make a list of this component

# Notifications:
         divide page into:
        1- sidebar
        2- upper (nav) div (header)
        3- main
    components:
        1- sidebar: upper div content -> <link>RECENT FOLLOWERS</link> + link "view all"
                    use ListOfArtistCards
                    some links
        2- <h1>Notifications</h1> + dropdown button (change main content not whole page, same url)

        3- if no content (no comments) show: <h3>You donnot have any {content name}</h3> + button "Show all notifications" below
           add a new folder "notification" inside features contains-> new component "NotificationList" that is a list of new component "NotificationItem"     
           use NotificationList

    in NotificaitonItem: 
        instead of Horizontalmore button -> use Blobk button
        if notification content is "x started following you" -> show follow button (same as SidebarArtistCard)  