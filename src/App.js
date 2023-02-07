import React, { useEffect, useState } from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  theme,
  Button,
  HStack,
  Input,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Alert,
  useToast,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import {
  connect,
  isMetaMaskInstalled,
  getProvider,
  getSigner,
} from './connection/metamask';
import { formatEther, Contract, toBeHex } from 'ethers';
import winner from './abi/winner.json';

function App() {
  const [account, setAccount] = useState('');
  const [myBalance, setMyBalance] = useState('');
  const [winnerName, setWinnerName] = useState('');
  const [newWinner, setNewWinner] = useState('');
  const [chainError, setChainError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (account) {
      getBalance(account);
      setChainError(null);
    }
    console.log(winner);
  });
  const checkMetamask = async () => {
    if (isMetaMaskInstalled) {
      if (window.ethereum.chainId === '0x13881') {
        const userAccount = await connect();
        console.log(userAccount);
        setAccount(userAccount[0]);
      } else {
        setChainError('change to Mumbai Polygon');
        throw new Error('change to Mumbai Polygon');
      }
    } else {
      throw new Error('Install metamask');
    }
  };

  const getBalance = async myAccount => {
    const provider = getProvider();
    const balance = await provider.getBalance(myAccount);
    console.log(formatEther(balance));
    setMyBalance(formatEther(balance));
    return balance;
  };

  const winnerContract = async () => {
    const abi = [
      'function getWinner() view external returns (string memory)',
      'function setWinner(string) returns (string)',
    ];
    const signer = await getSigner();
    // Create a contract
    const winnerContract = new Contract(
      '0x7A3318244fe91291045c3A6fBB73A843b5473e5E',
      abi,
      signer
    );
    return winnerContract;
  };

  const getWinner = async () => {
    try {
      const winnerCon = await winnerContract();
      console.log(winnerCon);
      const currentWinner = await winnerCon.getWinner();
      setWinnerName(currentWinner);
      console.log(currentWinner);
    } catch (error) {
      console.log(error);
    }
  };

  const setWinner = async () => {
    try {
      const winnerCon = await winnerContract();
      console.log(winnerCon);
      const tx = await winnerCon.setWinner(newWinner);
      const receipt = await tx.wait(1);
      if (receipt.status) {
        toast({
          position: 'bottom-left',
          render: () => (
            <Box color="white" p={3} bg="green.500">
              Transaction successful
            </Box>
          ),
        });
      }
      console.log(receipt);
    } catch (error) {
      console.log(error);
    }
  };

  const walletConnection = () => {
    try {
      checkMetamask();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            {chainError && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Wrong Network!</AlertTitle>
                <AlertDescription>
                  Please change to Polygon Mumbai testnet
                </AlertDescription>
              </Alert>
            )}
            <Text>Winner app</Text>
            <Text>{account}</Text>
            <Text>{myBalance}</Text>
            <Button onClick={walletConnection} disabled={account}>
              {account ? 'Connected' : 'Connect Wallet'}
            </Button>
            <HStack spacing="24px">
              <Button onClick={getWinner}>GetWinner</Button>
              <Text>{winnerName}</Text>
            </HStack>
            <HStack spacing="24px">
              <Input
                value={newWinner}
                onChange={e => setNewWinner(e.target.value)}
              ></Input>
              <Button onClick={setWinner}>Set Winner</Button>
            </HStack>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
