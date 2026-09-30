import { api } from './api';

export interface UpdateProfileData {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    bio?: string;
}

export interface UpdatePasswordData {
    oldPassword: string;
    newPassword: string;
}

export const userService = {
    async updateProfile(data: UpdateProfileData) {
        const response = await api.put('/users/me', data);
        return response.data;
    },

    async updatePassword(data: UpdatePasswordData) {
        const response = await api.patch('/users/password', data);
        return response.data;
    },

    async deleteAccount() {
        const response = await api.delete('/users/me');
        return response.data;
    }
};