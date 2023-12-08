import { getSubstrateChain, getSubstrateWallet, useBalance, useInkathon } from "@scio-labs/use-inkathon";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { truncateSuiTx } from "../../services/address";
import cn from "../../services/cn";
import api, { setAuthToken } from "../../utils/api";
import Button from "../Button/Button";
import Input from "../Input/Input";
import Popup from "../Popup/Popup";
import { usePopups } from "../Popup/PopupProvider";

const ChainWallet = {
  network: "alephzero-testnet",
  wallet: "subwallet-js",
};
export const resolverError = (key: string, type: string, message: string) => {
  return { [key]: { type, message } };
};

export function ConnectionSettings() {
  const { connect, error, isConnected, activeChain, activeAccount, disconnect } = useInkathon();
  const [isLoading, setIsLoading] = useState(false);

  const { balanceFormatted } = useBalance(activeAccount?.address, true);

  const { addPopup } = usePopups();

  useEffect(() => {
    setIsLoading(true);

    const substrateChain = getSubstrateChain(ChainWallet.network);
    const substrateWallet = getSubstrateWallet(ChainWallet.wallet);

    connect?.(substrateChain, substrateWallet);
    setIsLoading(false);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);

    const substrateChain = getSubstrateChain(ChainWallet.network);
    const substrateWallet = getSubstrateWallet(ChainWallet.wallet);

    await connect?.(substrateChain, substrateWallet);
    setIsLoading(false);
  };

  function hasJWT() {
    let flag = false;
    localStorage.getItem("token") ? (flag = true) : (flag = false);
    return flag;
  }

  useEffect(() => {}, [connect, isConnected, activeAccount]);

  const onHandleLogin = () => {
    addPopup({
      Component: () => {
        const [isLoadingLogin, setIsLoadingLogin] = useState(false);
        const {
          register,
          handleSubmit,
          setValue,
          watch,
          formState: { errors },
        } = useForm<{ password: string }>({
          mode: "onChange",
          reValidateMode: "onChange",
          shouldFocusError: true,
          shouldUnregister: false,
          resolver: async (values) => {
            let errors = {};

            if (!values.password) {
              errors = { ...errors, ...resolverError("password", "required", "password is required") };

              return { values, errors };
            }

            if (values.password.length < 5) {
              errors = { ...errors, ...resolverError("password", "required", "password must be better than 5 chars") };
              return { values, errors };
            }

            return { values, errors };
          },
        });
        const fields = watch();

        const submit = async () => {
          //reqres registered sample user
          setIsLoadingLogin(true);

          const loginPayload = {
            address: activeAccount?.address!,
            password: fields.password,
          };

          api
            .post("/create-user", loginPayload)
            .then((response) => {
              if (response.data.status === 200) {
                const token = response.data.data;
                localStorage.setItem("token", token);
                setAuthToken(token);
                window.location.href = "/";
              }
              setIsLoadingLogin(false);
              return;
            })
            .catch((err) => {
              console.log(err);
              setIsLoadingLogin(false);
              return;
            });
        };
        return (
          <Popup className="bg-gray-50 min-w-[500px] max-w-[600px]">
            <form onSubmit={handleSubmit(submit)} className="flex flex-col justify-center items-center space-y-2">
              <div className="py-2 w-1/2">
                <div className="text-[16px] font-bold">Account</div>
                <div className="max-w-[500px] border rounded-md p-2 text-center">{truncateSuiTx(activeAccount?.address!)}</div>
              </div>
              <div className="py-2 w-1/2">
                <div className="text-[16px] font-bold">Password</div>
                <div className="text-[13px]">Enter Password</div>

                <div className="max-w-[500px] flex justify-between items-center border rounded-xl my-2">
                  <div className="px-2">
                    <Input
                      className={cn("!w-full border-none border-transparent focus:border-transparent focus:!ring-0 !text-[14px] !pl-0 !pt-1 !pb-1 !leading-[30px]")}
                      placeholder="password"
                      autoComplete="off"
                      type="password"
                      {...register("password", { required: { value: true, message: "Please fill duration" } })}
                    />
                  </div>
                </div>
                <div className="text-red-500">{errors.password?.message}</div>
              </div>
              <Button
                className="cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 !rounded-3xl font-bold text-white min-w-[200px] leading-[21px]"
                size="small"
                type="submit"
                loading={isLoading}
              >
                Login
              </Button>
            </form>
          </Popup>
        );
      },
    });
  };

  if (isConnected && !hasJWT()) {
    return (
      <div
        className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500 !rounded-lg font-bold text-center text-white min-w-[150px] leading-[21px] py-1 cursor-pointer"
        onClick={() => onHandleLogin()}
      >
        <div className="font-bold">Login</div>
      </div>
    );
  }

  if (isConnected && hasJWT()) {
    return (
      <div className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500 !rounded-lg font-bold text-center text-white min-w-[150px] leading-[21px] py-1 cursor-pointer">
        <div className="font-bold">{truncateSuiTx(activeAccount?.address!)}</div>
      </div>
    );
  }

  return (
    <Button
      className="cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 !rounded-3xl font-bold text-white min-w-[200px] leading-[21px]"
      size="small"
      onClick={() => handleConnect()}
      loading={isLoading}
    >
      Connect Wallet
    </Button>
  );
}
