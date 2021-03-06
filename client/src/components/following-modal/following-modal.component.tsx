import { useDisclosure } from "@chakra-ui/hooks";
import { Flex, Spacer, Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { IUser } from "../../redux/user/user.slice";
import ControlFollowingButton from "../control-following-button/control-following-button.component";
import ShrimpUser from "../shrimp-user/shrimp-user.component";
import UnfollowButton from "../unfollow-button/unfollow-button.component";
import UnfollowModal from "../unfollow-modal/unfollow-modal.component";

interface FollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  isOtherUserFollowing?: boolean;
}

const FollowingModal = ({
  isOpen,
  onClose,
  user,
  isOtherUserFollowing,
}: FollowingModalProps) => {
  const {
    isOpen: isUnfollowModalOpen,
    onOpen: onUnfollowModalOpen,
    onClose: onUnfollowModalClose,
  } = useDisclosure();
  const currentLoggedUser: IUser | null = useAppSelector(
    (state: RootState) => state.user.currentUser
  );
  const unfollowModalUser: IUser | null = useAppSelector(
    (state: RootState) => state.userPage.unfollowModalUser
  );
  return (
    <>
      {unfollowModalUser ? (
        <UnfollowModal
          isOpen={isUnfollowModalOpen}
          onClose={onUnfollowModalClose}
          user={unfollowModalUser}
        />
      ) : (
        <></>
      )}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent p="0" minH="10rem" maxH="25rem" overflow="hidden">
          <ModalHeader p="0">
            <Text
              fontWeight="500"
              fontSize="md"
              textAlign="center"
              borderBottomWidth="1px"
              p="0.5rem 0"
            >
              Following
            </Text>
          </ModalHeader>
          <ModalCloseButton
            sx={{
              "&:active, &:focus": { boxShadow: "none" },
              "&:hover": { bgColor: "white" },
            }}
          />
          <ModalBody pt="0" overflowY="scroll">
            {user.following ? (
              user.following.map((following: IUser, index: number) => {
                const isFollowed: boolean = currentLoggedUser?.following
                  ? currentLoggedUser.following
                      .map((f: IUser) => f.id)
                      .includes(following.id)
                  : false;
                const isLoggedUser: boolean =
                  currentLoggedUser?.id === following.id;
                return (
                  <Flex align="center" key={index} onClick={onClose}>
                    <ShrimpUser user={following} />
                    <Spacer />
                    {!isLoggedUser ? (
                      isOtherUserFollowing ? (
                        <ControlFollowingButton
                          isFollowed={isFollowed}
                          user={following}
                        />
                      ) : (
                        <UnfollowButton
                          user={following}
                          onUnfollowModalOpen={onUnfollowModalOpen}
                        />
                      )
                    ) : (
                      <></>
                    )}
                  </Flex>
                );
              })
            ) : (
              <></>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FollowingModal;
