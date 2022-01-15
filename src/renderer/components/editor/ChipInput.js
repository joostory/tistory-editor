import React, { useEffect, useState } from 'react'
import { Box, Chip, TextField } from '@mui/material'
import update from 'immutability-helper'

function ChipInputTextField({label, placeholder, onAdd}) {
  function handleAdd(e) {
    onAdd(e.target.value.trim())
    e.target.value = ''
  }

  function handleInputKeyDown(e) {
    if ([9, 13, 188].find(v => v == e.keyCode)) {
      e.preventDefault()
      handleAdd(e)
      return
    }
  }

  function handleInputBlur(e) {
    handleAdd(e)
  }

  return (
    <TextField
      label={label} placeholder={placeholder}
      fullWidth
      onKeyDown={handleInputKeyDown}
      onBlur={handleInputBlur}
    />
  )
}


export default function ChipInput({label, placeholder, defaultValue, onChange}) {
  const [chips, setChips] = useState(defaultValue || [])

  function handleAdd(value) {
    if (value == '') {
      return
    }

    setChips(update(chips, {
      $push: [value]
    }))
  }

  function handleDelete(value) {
    let index = chips.findIndex(chip => chip == value)
    setChips(update(chips, {
      $splice: [[index, 1]]
    }))
  }

  useEffect(() => {
    onChange(chips)
  }, [chips])


  return (
    <>
      <ChipInputTextField
        label={label} placeholder={placeholder}
        onAdd={handleAdd}
      />

      <Box>
        {chips.map(value =>
          <Chip
            key={value}
            label={value}
            sx={{margin:(theme) => theme.spacing(1/2)}}
            onDelete={() => handleDelete(value)}
          />
        )}
      </Box>
      
    </>
  )
}
