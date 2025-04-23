/** @format */

import HeadingComponent from "@/components/ui/heading";
import { ChromeProfileForm } from "../components/chrome-form";
import { useParams } from "react-router-dom";
import useChromeStore from "@/hooks/use-chromes";
const ChromeEditView = () => {
  const params = useParams();
  const id = params.id;
  const chromeStore = useChromeStore();
  const chromeProfile = chromeStore.getChromeProfileWithID(id);

  return (
    <>
      <HeadingComponent title="Chỉnh sửa profile" />
      <ChromeProfileForm initialData={chromeProfile} />
    </>
  );
};

export default ChromeEditView;
