import { Flex, Text } from "@chakra-ui/layout";
import { Link } from "react-router-dom";
import { IActivity } from "../../redux/activities/activities.slice";
import Avatar from "../avatar/avatar.component";

interface ActivityProps {
  data: IActivity;
  [propName: string]: any;
}

const Activity = ({ data, ...otherProps }: ActivityProps) => {
  return (
    <Flex cursor="pointer" align="center" {...otherProps} m="0.5rem 0">
      <Link to={`/${data.author.username}`}>
        <Avatar src={data.author?.avatarUrl} h="2rem" w="2rem" />
      </Link>
      <Link to={`/${data.author.username}`}>
        <Text
          ml="0.6rem"
          fontSize="xs"
          fontWeight="500"
          color="#2a2a2a"
          sx={{
            "&:active": {
              opacity: 0.6,
            },
          }}
        >
          {data.author.username}
        </Text>
      </Link>
      <Text fontSize="xs" minW="8rem" ml="0.3rem">
        {data.content}
      </Text>
    </Flex>
  );
};

export default Activity;
