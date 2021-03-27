import { Button } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import { Flex, Spacer } from "@chakra-ui/layout";
import { Popover, PopoverContent, PopoverTrigger } from "@chakra-ui/popover";
import { Fragment } from "react";
import { VscSmiley } from "react-icons/vsc";
import { POST_PAGE, USER_PAGE } from "../../constants";
import { IPost, setCommentInput } from "../../redux/feed/feed.slice";
import { useAppDispatch } from "../../redux/hooks";
import { setPostPageCommentInput } from "../../redux/post-page/post-page.slice";
import { setUserPageCommentInput } from "../../redux/user-page/user-page.slice";
import EmojiText from "../emoji-text/emoji-text.component";

interface IEmoji {
  id: number;
  content: string;
}

interface EmojiPopoverProps {
  post: IPost;
  page?: string;
}

const EmojiPopover = ({ post, page }: EmojiPopoverProps) => {
  const dispatch = useAppDispatch();
  const emojies: IEmoji[] = [
    { id: 1, content: "😀" },
    { id: 2, content: "🤩" },
    { id: 3, content: "☺" },
    { id: 4, content: "👺" },
    { id: 5, content: "❤" },
  ];
  const commentInput: string = post.commentInput;
  const emojiPickHandler = (emoji: IEmoji) => {
    const commentContent = {
      postId: post.id,
      commentInput: (commentInput ? commentInput : "") + emoji.content,
    };
    switch (page) {
      case USER_PAGE:
        dispatch(setUserPageCommentInput(commentContent));
        break;
      case POST_PAGE:
        dispatch(
          setPostPageCommentInput(
            (commentInput ? commentInput : "") + emoji.content
          )
        );
        break;
      default:
        dispatch(setCommentInput(commentContent));
    }
  };
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          sx={{
            "&:focus, &:hover": { boxShadow: "none", bgColor: "transparent" },
          }}
          bgColor="transparent"
        >
          <Icon
            as={VscSmiley}
            mt="0.5rem"
            ml="0.5rem"
            cursor="pointer"
            w={7}
            h={7}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent sx={{ "&:focus": { boxShadow: "none" } }}>
        <Flex
          p="1rem"
          align="center"
          bgColor="white"
          w="15rem"
          h="3.5rem"
          borderRadius="5px"
          boxShadow="md"
          overflow="hidden"
        >
          {emojies.map((emoji: IEmoji, index: number) => {
            return (
              <Fragment key={index}>
                <EmojiText
                  fontSize="xl"
                  cursor="pointer"
                  onClick={() => emojiPickHandler(emoji)}
                >
                  {emoji.content}
                </EmojiText>
                {index !== emojies.length - 1 ? <Spacer /> : <></>}
              </Fragment>
            );
          })}
        </Flex>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPopover;
