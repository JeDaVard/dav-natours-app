/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    try {
        const url =
            type === 'password'
                ? '/api/v1/users/update-password'
                : '/api/v1/users/edit';

        const res = await axios({
            method: 'PATCH',
            url,
            data,
        });

        if (res.data.status === 'success') {
            if (data.getAll('photo')[0] === "undefined") {
                showAlert('success', `Updated successfully!`);
            } else {
                showAlert('success', `Updated successfully! Please, reload the page.`);
            }
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
