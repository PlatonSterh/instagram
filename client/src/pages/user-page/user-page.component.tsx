import { useDisclosure } from "@chakra-ui/hooks";
import { Box, Center, Divider, Flex, Spacer, Text } from "@chakra-ui/layout";
import { useMediaQuery } from "@chakra-ui/media-query";
import { useEffect } from "react";
import { useParams } from "react-router";
import Avatar from "../../components/avatar/avatar.component";
import Categories from "../../components/categories/categories.component";
import ChangePhotoModal from "../../components/change-photo-modal/change-photo-modal.component";
import FollowersModal from "../../components/followers-modal/followers-modal.component";
import FollowingModal from "../../components/following-modal/following-modal.component";
import Header from "../../components/header/header.component";
import NoPostsBanner from "../../components/no-posts-banner/no-posts-banner.component";
import ProfileData from "../../components/profile-data/profile-data.component";
import UserPosts from "../../components/user-posts/user-posts.component";
import UserStatistics from "../../components/user-statistics/user-statistics.component";
import { IPost } from "../../redux/feed/feed.slice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import {
  POSTS,
  requestUserData,
  requestUserPagePosts,
  requestUserPageSavedPosts,
  selectAllUserPagePosts,
} from "../../redux/user-page/user-page.slice";
import { IUser, requestUserById } from "../../redux/user/user.slice";

const UserPage = () => {
  const params: any = useParams();
  const username: string = params.username;
  const dispatch = useAppDispatch();
  const token: string | null = localStorage.getItem("authToken");
  const isUnfollowLoading: boolean = useAppSelector(
    (state: RootState) => state.userPage.unfollowLoading === "loading"
  );
  const isFollowLoading: boolean = useAppSelector(
    (state: RootState) => state.userPage.followLoading === "loading"
  );
  useEffect(() => {
    if (token) {
      dispatch(requestUserData({ input: { username } }));
      dispatch(requestUserPagePosts({ input: { username, token } }));
      dispatch(requestUserPageSavedPosts({ input: { token } }));
    }
  }, [dispatch, username, token, isUnfollowLoading, isFollowLoading]);
  const loggedUser: IUser | null = useAppSelector(
    (state: RootState) => state.user.currentUser
  );
  useEffect(() => {
    if ((!isUnfollowLoading || !isFollowLoading) && loggedUser?.id) {
      dispatch(requestUserById({ input: { userId: Number(loggedUser.id) } }));
    }
  }, [dispatch, isUnfollowLoading, isFollowLoading, loggedUser?.id]);
  const state: RootState = useAppSelector((state: RootState) => state);
  const user: IUser | null = useAppSelector(
    (state: RootState) => state.userPage.user
  );
  const category: string = useAppSelector(
    (state: RootState) => state.userPage.category
  );
  const userPagePostsData: unknown[] = selectAllUserPagePosts(state);
  const userPagePosts: IPost[] = userPagePostsData as IPost[];
  const userPosts: IPost[] = userPagePosts.filter(
    (post: IPost) => post.author.id === user?.id
  );
  const savedPosts: IPost[] = userPagePosts.filter(
    (post: IPost) => post.isBookmarked
  );
  const isItLoggedUserPage: boolean = useAppSelector(
    (state: RootState) => state.user.currentUser?.id === user?.id
  );
  const currentUser: IUser | null = useAppSelector(
    (state: RootState) => state.user.currentUser
  );
  let isFollowed: boolean = false;
  if (currentUser) {
    isFollowed = currentUser?.following
      ? currentUser.following.findIndex(
          (followingUser: IUser) => followingUser.id === user?.id
        ) !== -1
      : false;
  }
  const {
    isOpen: isChangePhotoModalOpen,
    onOpen: onChangePhotoModalOpen,
    onClose: onChangePhotoModalClose,
  } = useDisclosure();
  const {
    isOpen: isFollowersModalOpen,
    onOpen: onFollowersModalOpen,
    onClose: onFollowersModalClose,
  } = useDisclosure();
  const {
    isOpen: isFollowingModalOpen,
    onOpen: onFollowingModalOpen,
    onClose: onFollowingModalClose,
  } = useDisclosure();
  const [isLessThan820] = useMediaQuery("(max-width: 820px)");
  return (
    <>
      {user ? (
        <>
          <FollowersModal
            isOpen={isFollowersModalOpen}
            onClose={onFollowersModalClose}
            user={user}
          />
          <FollowingModal
            isOpen={isFollowingModalOpen}
            onClose={onFollowingModalClose}
            user={user}
            isOtherUserFollowing={!isItLoggedUserPage}
          />
        </>
      ) : (
        <></>
      )}
      <Header />
      <Box
        p={
          !isLessThan820
            ? user
              ? "5rem 0 1rem 12rem"
              : "5rem 0 1rem 0"
            : "4rem 0 1rem 0"
        }
        w="100%"
        minH="100vh"
        bgColor="#fafafa"
      >
        {user ? (
          <>
            <ChangePhotoModal
              isOpen={isChangePhotoModalOpen}
              onClose={onChangePhotoModalClose}
            />
            <Flex
              align="center"
              ml={isLessThan820 ? "1rem" : "4rem"}
              maxW="33rem"
            >
              <Avatar
                w={isLessThan820 ? "4.5rem" : "9rem"}
                h={isLessThan820 ? "4.5rem" : "9rem"}
                src={user.avatarUrl}
                onClick={onChangePhotoModalOpen}
              />
              {!isLessThan820 ? <Spacer /> : <></>}
              <ProfileData
                user={user}
                postsCount={userPosts.length}
                ml="1rem"
                isItPageOfLoggedUser={isItLoggedUserPage}
                isFollowed={isFollowed}
                onFollowersModalOpen={onFollowersModalOpen}
                onFollowingModalOpen={onFollowingModalOpen}
              />
            </Flex>
            {isLessThan820 ? (
              <>
                <Divider mt="4rem" maxW="58rem" borderColor="#c7c7c7" />
                <UserStatistics
                  postsCount={userPosts.length}
                  user={user}
                  onFollowersModalOpen={onFollowersModalOpen}
                  onFollowingModalOpen={onFollowingModalOpen}
                />
              </>
            ) : (
              <></>
            )}
            <Divider
              mt={isLessThan820 ? "1rem" : "4rem"}
              maxW="58rem"
              borderColor="#c7c7c7"
            />
            <Categories />
            <Center maxW="60rem">
              {category === POSTS ? (
                userPosts.length ? (
                  <UserPosts posts={userPosts} />
                ) : isItLoggedUserPage ? (
                  <NoPostsBanner />
                ) : (
                  <></>
                )
              ) : (
                <UserPosts posts={savedPosts} />
              )}
            </Center>
          </>
        ) : (
          <Flex minH="70vh" align="center" justify="center">
            <Text fontSize="3xl" color="gray.500" fontWeight="500">
              USER NOT FOUND
            </Text>
          </Flex>
        )}
      </Box>
    </>
  );
};

export default UserPage;
