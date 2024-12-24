import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

const DeleteDialog = ({ open, handleClose, handleDelete }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText>Are you sure you want to delete this record?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button sx={{borderRadius:"100px",border:"2px solid"}} onClick={handleClose}>Cancel</Button>
                <Button sx={{borderRadius:"100px",bgcolor:"#F44336",color:"#FFFFFF"}} onClick={handleDelete}>Delete</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;