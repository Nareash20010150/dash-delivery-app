/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormLabel,
  FormControl,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { UpdateShipmentModelProps, ShipmentInfo } from "../types";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../provider/AuthProvider";
import { updateShipmentApi } from "../apis/ShipmentApi";
import { useNavigate } from "react-router-dom";

const UpdateShipmentModel: React.FC<UpdateShipmentModelProps> = ({
  setIsOpen,
  isOpen,
  setShipmentInfo,
  shipment,
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { token, setIsAuthenticated, setToken } = authContext;
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [packageDescription, setPackageDescription] = useState<string>("");
  const [packageWeight, setPackageWeight] = useState<string>("");

  const [recipientNameError, setRecipientNameError] = useState<string>("");
  const [recipientAddressError, setRecipientAddressError] =
    useState<string>("");
  const [packageDescriptionError, setPackageDescriptionError] =
    useState<string>("");
  const [packageWeightError, setPackageWeightError] = useState<string>("");

  const [recipientNameErrorFlag, setRecipientNameErrorFlag] =
    useState<boolean>(false);
  const [recipientAddressErrorFlag, setRecipientAddressErrorFlag] =
    useState<boolean>(false);
  const [packageDescriptionErrorFlag, setPackageDescriptionErrorFlag] =
    useState<boolean>(false);
  const [packageWeightErrorFlag, setpackageWeightErrorFlag] =
    useState<boolean>(false);

  useEffect(() => {
    setRecipientName(shipment.recipientName);
    setRecipientAddress(shipment.recipientAddress);
    setPackageDescription(shipment.packageDescription);
    setPackageWeight(shipment.packageWeight);
  }, [shipment]);

  const handleUpdateShipment = async () => {
    try {
      const shipmentInfo: ShipmentInfo = {
        recipientName: recipientName,
        recipientAddress: recipientAddress,
        packageDescription: packageDescription,
        packageWeight: packageWeight,
      };
      const response = await updateShipmentApi(
        shipment.id,
        shipmentInfo,
        token
      );
      toast({
        title: "Shipment updated sucessfully",
        position: "top-right",
        status: "success",
        isClosable: true,
      });
      setShipmentInfo((prevShipmentInfo) => {
        const updatedShipmentInfo = prevShipmentInfo.filter(
          (item) => item.id !== shipment.id
        );
        return [...updatedShipmentInfo, response];
      });
      setIsOpen(false);
      setRecipientName("");
      setRecipientAddress("");
      setPackageDescription("");
      setPackageWeight("");
    } catch (error) {
      let errorMessage: string;
      if (error instanceof Error) {
        if (error.message === "Invalid token") {
          localStorage.removeItem("token");
          setToken("");
          setIsAuthenticated(false);
          navigate("/home");
          errorMessage = "Session expired";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = String(error);
      }
      toast({
        title: errorMessage,
        position: "top-right",
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleRecipientNameChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setRecipientName(e.target.value);
    if (recipientName.length < 3) {
      setRecipientNameError(
        "Recipient name should be at least 3 characters long"
      );
      setRecipientNameErrorFlag(true);
    } else {
      setRecipientNameErrorFlag(false);
      setRecipientNameError("");
    }
  };

  const handleRecipientAddressChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setRecipientAddress(e.target.value);
    if (recipientAddress.length < 8) {
      setRecipientAddressError(
        "Recipient address should be at least 8 characters long"
      );
      setRecipientAddressErrorFlag(true);
    } else {
      setRecipientAddressErrorFlag(false);
      setRecipientAddressError("");
    }
  };

  const handlePackageDescriptionChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setPackageDescription(e.target.value);
    if (packageDescription.length < 8) {
      setPackageDescriptionError(
        "Recipient name should be at least 8 characters long"
      );
      setPackageDescriptionErrorFlag(true);
    } else {
      setPackageDescriptionErrorFlag(false);
      setPackageDescriptionError("");
    }
  };

  const handlePackageWeightChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setPackageWeight(e.target.value);
    if (packageWeight.length < 3) {
      setpackageWeightErrorFlag(false);
      setPackageWeightError("");
    } else {
      setPackageWeightError("Package Weight should be less than 100 kg");
      setpackageWeightErrorFlag(true);
    }
  };
  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setRecipientName("");
        setRecipientAddress("");
        setPackageDescription("");
        setPackageWeight("");
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update shipment</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Recipient name</FormLabel>
            <Input
              type="text"
              onChange={handleRecipientNameChange}
              value={recipientName}
            />
            <p className="text-red-600">{recipientNameError}</p>
            <FormLabel className="my-5">Recipient address</FormLabel>
            <Input
              type="text"
              onChange={handleRecipientAddressChange}
              value={recipientAddress}
            />
            <p className="text-red-600">{recipientAddressError}</p>
            <FormLabel className="my-5">Package Description</FormLabel>
            <Textarea
              placeholder="Type your address"
              size="md"
              onChange={handlePackageDescriptionChange}
              value={packageDescription}
            />
            <p className="text-red-600">{packageDescriptionError}</p>
            <FormLabel className="my-5">Package weight</FormLabel>
            <Input
              type="number"
              onChange={handlePackageWeightChange}
              value={packageWeight}
            />
            <p className="text-red-600">{packageWeightError}</p>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            isDisabled={
              recipientAddressErrorFlag ||
              recipientNameErrorFlag ||
              packageDescriptionErrorFlag ||
              packageWeightErrorFlag
            }
            onClick={handleUpdateShipment}
          >
            Update
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              setRecipientName("");
              setRecipientAddress("");
              setPackageDescription("");
              setPackageWeight("");
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateShipmentModel;
