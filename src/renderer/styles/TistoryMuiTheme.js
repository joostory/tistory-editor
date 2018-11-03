
const styles = theme => ({
  button: {
    borderRadius: "18px",
    color: "#fff",
    backgroundColor: "#000",
    "&:hover": {
      backgroundColor: "#f54"
    },
    ":disabled": {
      backgroundColor: "#b9b9b9"
    }
  },

  blockCenter: {
    margin: "0 auto"
  }
})

export default styles
