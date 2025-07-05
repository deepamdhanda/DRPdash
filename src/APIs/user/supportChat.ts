import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { supportChat_url } from "../../URLs/user";


export const fetchTopics = async (type: string, parentId: string | null = null) => {
    try {
        const res = await appAxios.get(`${supportChat_url}/topics?type=${type}${parentId ? `&parentId=${parentId}` : ''}`)
        return res.data
    } catch (err) {
        console.error(err)
        return []
    }
}

export const fetchGyaan = async () => {
    try {
        const res = await appAxios.get(`${supportChat_url}/gyaan`)
        return res.data
    } catch (err) {
        console.error(err)
        return []
    }
}

export const getAllSupportChats = async () => {
    try {
        const response = await appAxios.get(supportChat_url, {
            withCredentials: true,
        });
        return response.data as any[];
    } catch (error: any) {
        toast.error("Failed to fetch pools.");
        throw error;
    }
};

export const createSupportChat = async (data: any) => {
    try {
        // console.log(data)
        // return 0;
        const response = await appAxios.post(supportChat_url, data);
        toast.success("SupportChat created successfully!");
        return response.data;
    } catch (error: any) {
        toast.error("Failed to create supportChat.");
        throw error;
    }
};

export const updateSupportChat = async (id: string, data: any) => {
    try {
        await appAxios.patch(`${supportChat_url}/${id}`, data);
        toast.success("SupportChat updated successfully!");
        return true;
    } catch (error: any) {
        toast.error("Failed to update supportChat.");
        throw error;
    }
};

export const deleteSupportChat = async (id: string) => {
    try {
        await appAxios.delete(`${supportChat_url}/${id}`);
        toast.success("SupportChat deleted successfully!");
    } catch (error: any) {
        toast.error("Failed to delete supportChat.");
        throw error;
    }
};
