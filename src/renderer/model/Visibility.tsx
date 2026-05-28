import React from 'react'
import { Drafts } from '@mui/icons-material'

class Visibility {
  value: number
  name: string

  constructor(value: string | number) {
    this.value = typeof value === 'string' ? Number.parseInt(value, 10) : value
    this.name = this.toString()
  }

  toString(): string {
    switch (this.value) {
      case 2:
      case 3:
      case 20:
        return "발행"
      default:
        return "저장"
    }
  }

  toMaterialIcon(): React.ReactNode {
    switch (this.value) {
      case 2:
      case 3:
      case 20:
        return null
      default:
        return <Drafts />
    }
  }
}

export default Visibility
