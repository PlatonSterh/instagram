import Icon from "@chakra-ui/icon";
import { Flex, Spacer } from "@chakra-ui/layout";
import { chakra } from "@chakra-ui/system";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Link } from "react-router-dom";
import { POST_PAGE, USER_PAGE } from "../../constants";
import {
  IComment,
  likeComment,
  unlikeComment,
} from "../../redux/feed/feed.slice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  likePostPageComment,
  unlikePostPageComment,
} from "../../redux/post-page/post-page.slice";
import { RootState } from "../../redux/store";
import {
  likeUserPageComment,
  unlikeUserPageComment,
} from "../../redux/user-page/user-page.slice";
import { IUser } from "../../redux/user/user.slice";
import EmojiText from "../emoji-text/emoji-text.component";
import MotionBox from "../motion-box/motion-box.component";

interface CommentProps {
  comment: IComment;
  full?: boolean;
  page?: string;
  [propName: string]: any;
}

const Comment = ({ comment, full, page, ...otherProps }: CommentProps) => {
  const dispatch = useAppDispatch();
  const isLiked: boolean = comment.isLiked;
  const postId: number = comment.postId;
  const user: IUser | null = useAppSelector(
    (state: RootState) => state.user.currentUser
  );
  const token: string | null = localStorage.getItem("authToken");
  const commentLikeHandler = (comment: IComment) => {
    if (comment.id && user) {
      switch (page) {
        case USER_PAGE:
          if (token) {
            if (isLiked)
              dispatch(
                unlikeUserPageComment({ token, postId, commentId: +comment.id })
              );
            else
              dispatch(
                likeUserPageComment({ token, postId, commentId: +comment.id })
              );
          }
          break;
        case POST_PAGE:
          if (token) {
            if (isLiked)
              dispatch(
                unlikePostPageComment({ token, postId, commentId: +comment.id })
              );
            else
              dispatch(
                likePostPageComment({ token, postId, commentId: +comment.id })
              );
          }
          break;
        default:
          if (token) {
            if (isLiked)
              dispatch(
                unlikeComment({ token, postId, commentId: +comment.id })
              );
            else
              dispatch(likeComment({ token, postId, commentId: +comment.id }));
          }
          break;
      }
    }
  };
  return (
    <Flex display="inline-flex" w={full ? "16rem" : "100%"}>
      <EmojiText fontSize="sm" maxW="30rem" overflow="hidden" {...otherProps}>
        <chakra.span
          as={Link}
          to={`/${comment.authorName}/`}
          fontSize="sm"
          fontWeight="500"
          color="#2a2a2a"
          mr="0.3rem"
          sx={{
            "&:hover": {
              textDecoration: "underline",
            },
            "&:active": {
              opacity: 0.6,
            },
          }}
        >
          {comment.authorName}
        </chakra.span>
        {comment.content}
      </EmojiText>
      <Spacer />
      <MotionBox
        w={7}
        h={7}
        whileTap={{ scale: 1.2 }}
        position="relative"
        right={full ? "0" : "-0.5rem"}
      >
        <Icon
          as={isLiked ? AiFillHeart : AiOutlineHeart}
          color={isLiked ? "red.500" : ""}
          w={3}
          h={3}
          cursor="pointer"
          onClick={() => commentLikeHandler(comment)}
        />
      </MotionBox>
    </Flex>
  );
};

export default Comment;
