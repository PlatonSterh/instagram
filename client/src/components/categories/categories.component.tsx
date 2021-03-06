import Icon from "@chakra-ui/icon";
import { Flex, Spacer } from "@chakra-ui/layout";
import { BsGrid3X3 } from "react-icons/bs";
import { RiBookmarkLine } from "react-icons/ri";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { POSTS, SAVED } from "../../redux/user-page/user-page.slice";
import { IUser } from "../../redux/user/user.slice";
import Category from "../category/category.component";

const Categories = () => {
  const activeCategory: string = useAppSelector(
    (state: RootState) => state.userPage.category
  );
  const pageOwner: IUser | null = useAppSelector(
    (state: RootState) => state.userPage.user
  );
  const loggedUser: IUser | null = useAppSelector(
    (state: RootState) => state.user.currentUser
  );
  return (
    <Flex position="relative" top="-1px" maxW="58rem" justify="center">
      <Flex w="10rem" justify="center">
        <Category category={POSTS} isActive={activeCategory === POSTS}>
          <Icon
            as={BsGrid3X3}
            w={3}
            h={3}
            color={activeCategory === POSTS ? "" : "#939393"}
          />
        </Category>
        {pageOwner?.id === loggedUser?.id ? (
          <>
            <Spacer />
            <Category category={SAVED} isActive={activeCategory === SAVED}>
              <Icon
                as={RiBookmarkLine}
                w={3}
                h={3}
                color={activeCategory === SAVED ? "" : "#939393"}
              />
            </Category>
          </>
        ) : (
          <></>
        )}
      </Flex>
    </Flex>
  );
};

export default Categories;
