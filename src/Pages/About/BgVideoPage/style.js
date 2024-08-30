export const ContainerStyle = {
    marginTop: '30px',
    maxWidth: 'lg',
};
export const BoxStyle = (showVideo) => ({
    position: 'relative',
    width: '100%',
    height: '0',
    paddingBottom: '56.25%',
    cursor: 'pointer',
    backgroundImage: !showVideo ? `url(${require('./assets/StudentImg.png')})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '16px',
    overflow: 'hidden',
});

export const PlayButtonStyle = {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    height: 'auto',
    zIndex: 1,
};

export const IframeStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
};

