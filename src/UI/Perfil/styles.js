const imagenMuniCordoba = require("../../_Resources/imagenes/escudo_muni_texto_verde.png");
const imagenMuniOnline = require("../../_Resources/imagenes/escudo_muni_online_verde_ancho.png");

const maxWidth = 800;
const heightGap = 80;
const heightPanelVerde = 136;
const toolbarHeight = 56;
const logosHeight = 56;

const styles = theme => {
  return {
    opacityView: {
      transition: "all 0.3s",
      opacity: 0,
      pointerEvents: "none",
      "&.visible": {
        opacity: 1,
        pointerEvents: "all"
      }
    },
    translateView: {
      transition: "all 0.3s",
      transform: "translateY(50px)",
      opacity: 0,
      pointerEvents: "none",
      "&.visible": {
        opacity: 1,
        transform: "translateY(0px)",
        pointerEvents: "all"
      }
    },
    contenedorCargando: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      transition: "all 0.3s",
      opacity: 0,
      pointerEvents: "none",
      backgroundColor: "rgba(255,255,255,0.7)",
      "&.visible": {
        opacity: 1,
        pointerEvents: "all"
      }
    },
    root: {
      display: "flex",
      position: "relative",
      alignItems: "center",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      overflow: "auto"
    },
    panelVerde: {
      position: "absolute",
      width: "100%",
      backgroundColor: theme.palette.primary.main,
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      transition: "all 0.3s",
      height: heightPanelVerde,
      [theme.breakpoints.up("sm")]: {
        height: heightPanelVerde + heightGap
      }
    },
    contenedorLogos: {
      maxWidth: maxWidth,
      height: logosHeight,
      top: heightPanelVerde - toolbarHeight - logosHeight - 16,
      display: "flex",
      alignItems: "center",
      position: "absolute",
      paddingLeft: 16,
      paddingRight: 16,
      width: "100%",
      "& .muniCordoba": {
        marginRight: theme.spacing.unit * 2,
        backgroundPosition: "center left",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundImage: `url(${imagenMuniCordoba})`,
        filter: "saturate(0%) brightness(0) invert(100%)",
        flex: 1,
        height: "100%"
      },
      "& .muniOnline": {
        backgroundPosition: "center right",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundImage: `url(${imagenMuniOnline})`,
        filter: "saturate(0%) brightness(0) invert(100%)",
        height: "100%",
        flex: 1,
        maxWidth: 200
      },
      [theme.breakpoints.up("sm")]: {
        top: heightPanelVerde + heightGap - toolbarHeight - logosHeight - 16
      }
    },
    tituloVecinoVirtual: {
      color: "white",
      fontSize: 26
    },
    panelContenido: {
      marginTop: heightPanelVerde - toolbarHeight,
      width: "100%",
      maxWidth: maxWidth,
      bottom: "-16px",
      opacity: 0,
      transition: "all 0.3s",
      "&.visible": {
        transform: "translateY(0px)",
        opacity: 1
      },
      "& .titulo": {
        fontSize: 20,
        marginTop: "16px",
        marginBottom: "16px",
        textAlign: "center"
      },
      [theme.breakpoints.up("sm")]: {
        marginTop: heightPanelVerde + heightGap - toolbarHeight
      }
    },
    toolbar: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      paddingLeft: 8,
      paddingRight: 8,
      backgroundColor: "rgba(0,0,0,0.025)",
      alignItems: "center",
      display: "flex",
      borderBottom: "1px solid rgba(0,0,0,0.1)",
      height: toolbarHeight
    },
    contenedorFoto: {
      marginTop: theme.spacing.unit * 4,
      marginBottom: theme.spacing.unit * 4,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      "& *": {
        cursor: "pointer"
      },
      "& .foto": {
        borderRadius: "156px",
        width: "156px",
        height: "156px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "& > div": {
          transition: "all 0.3s",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          borderRadius: "156px",
          width: "156px",
          height: "156px",
          position: "absolute"
        },
        "& > .texto": {
          transition: "all 0.3s",
          opacity: 0,
          zIndex: 1,
          color: "black"
        },
        "&:hover": {
          "& > div": {
            opacity: 0.2
          },
          "& > .texto": {
            opacity: 1
          }
        }
      },
      "& .nombre": {
        marginTop: theme.spacing.unit * 2
      }
    },
    card: {
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3)"
    },
    cardDatosPersonales: {
      padding: theme.spacing.unit * 2
    },
    cardDatosAcceso: {
      padding: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 4
    },
    cardDatosDeContacto: {
      padding: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 4
    },
    cardDatosDomicilio: {
      padding: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 4,
      marginBottom: theme.spacing.unit * 4
    },
    contenedorError: {
      borderRadius: theme.spacing.unit
    },
    contenedorBotones: {
      display: "flex",
      marginTop: theme.spacing.unit * 2,
      borderTop: "1px solid rgba(0,0,0,0.1)",
      paddingTop: theme.spacing.unit * 2,
      alignItems: "flex-end",
      justifyContent: "flex-end"
    }
  };
};
export default styles;
