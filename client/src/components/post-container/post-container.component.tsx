import { Box, Flex, useDisclosure, useMediaQuery } from "@chakra-ui/react";
import { useRef } from "react";
import { IPost } from "../../redux/feed/feed.slice";
import findTimeDifference from "../../utils/findTimeDifference.util";
import CommentInput from "../comment-input/comment-input.component";
import FullComments from "../full-comments/full-comments.component";
import PostActions from "../post-actions/post-actions.component";
import PostContent from "../post-content/post-content.component";
import PostFooter from "../post-footer/post-footer.component";
import PostHeader from "../post-header/post-header.component";
import Time from "../time/time.component";

interface PostContainerProps {
  post: IPost;
  full?: boolean;
  page?: string;
}

const PostContainer = ({ post, full, page }: PostContainerProps) => {
  const inputRef: any = useRef(null);
  const timeAgo: string = findTimeDifference(
    new Date(Date.parse(post.createdAt))
  );
  const {
    isOpen: isPostPageOpen,
    onOpen: onPostPageOpen,
    onClose: onPostPageClose,
  } = useDisclosure();
  const [isLessThan820] = useMediaQuery("(max-width: 820px)");
  return (
    <Box
      maxW={full ? "60rem" : "38rem"}
      borderWidth="1px"
      borderRadius="3px"
      overflow="hidden"
      mt="2rem"
    >
      {full ? (
        <>
          <Flex direction={isLessThan820 ? "column" : "row"}>
            {isLessThan820 ? (
              <PostHeader h="3.5rem" author={post.author} postId={post.id} />
            ) : (
              <></>
            )}
            <PostContent w="40rem" imageUrl={post.imageUrl} />
            <Box w="20rem" borderLeftWidth="1px">
              {!isLessThan820 ? (
                <>
                  <PostHeader
                    h="4.5rem"
                    author={post.author}
                    postId={post.id}
                  />
                  <FullComments comments={post.comments} page={page} />
                </>
              ) : (
                <></>
              )}
              <Box h="35%">
                <Box p="0.8rem" bgColor="white" borderTopWidth="1px">
                  <PostActions
                    post={post}
                    inputRef={inputRef}
                    isPostPageOpen={isPostPageOpen}
                    onPostPageOpen={onPostPageOpen}
                    onPostPageClose={onPostPageClose}
                    page={page}
                    full
                  />
                  <Time timeAgo={timeAgo} />
                </Box>
                <CommentInput inputRef={inputRef} post={post} page={page} />
              </Box>
            </Box>
          </Flex>
        </>
      ) : (
        <>
          <PostHeader author={post.author} postId={post.id} />
          <PostContent imageUrl={post.imageUrl} />
          <PostFooter
            inputRef={inputRef}
            post={post}
            isPostPageOpen={isPostPageOpen}
            onPostPageOpen={onPostPageOpen}
            onPostPageClose={onPostPageClose}
          />
          <CommentInput inputRef={inputRef} post={post} />
        </>
      )}
    </Box>
  );
};

export default PostContainer;
