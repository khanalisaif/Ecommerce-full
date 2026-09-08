import api from './api'

// Matches backend: /api/user/profile/*
export const profileService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (payload) => api.put('/user/profile', payload), // { fullName, gender, dob, interests }

  updateProfilePicture: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.put('/user/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  changePassword: (payload) => api.put('/user/profile/change-password', payload), // { currentPassword, newPassword }
}

export default profileService
