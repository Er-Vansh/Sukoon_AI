"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Brain, Heart, Smile, Sun, Moon, Cloud, Star, Zap, RefreshCw } from "lucide-react"

const icons = [
  { icon: Brain, id: "brain" },
  { icon: Heart, id: "heart" },
  { icon: Smile, id: "smile" },
  { icon: Sun, id: "sun" },
  { icon: Moon, id: "moon" },
  { icon: Cloud, id: "cloud" },
]

const cardPairs = [...icons, ...icons]

interface CardData {
  id: string
  uniqueId: number
  isFlipped: boolean
  isMatched: boolean
  Icon: any
}

export function MemoryMap() {
  const [cards, setCards] = useState<CardData[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  const initializeGame = () => {
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: item.id,
        uniqueId: index,
        isFlipped: false,
        isMatched: false,
        Icon: item.icon,
      }))
    setCards(shuffledCards)
    setFlippedCards([])
    setMatches(0)
    setAttempts(0)
    setIsLocked(false)
  }

  useEffect(() => {
    initializeGame()
  }, [])

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return

    const newCards = [...cards]
    newCards[index].isFlipped = true
    setCards(newCards)

    const newFlipped = [...flippedCards, index]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setIsLocked(true)
      setAttempts((prev) => prev + 1)

      const [firstIndex, secondIndex] = newFlipped
      if (cards[firstIndex].id === cards[secondIndex].id) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards]
          matchedCards[firstIndex].isMatched = true
          matchedCards[secondIndex].isMatched = true
          setCards(matchedCards)
          setMatches((prev) => prev + 1)
          setFlippedCards([])
          setIsLocked(false)
        }, 600)
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards]
          resetCards[firstIndex].isFlipped = false
          resetCards[secondIndex].isFlipped = false
          setCards(resetCards)
          setFlippedCards([])
          setIsLocked(false)
        }, 1000)
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex justify-between w-full max-w-md items-center mb-2">
        <div className="text-sm font-medium">
          Matches: <span className="text-primary">{matches} / {icons.length}</span>
        </div>
        <div className="text-sm font-medium">
          Attempts: <span className="text-primary">{attempts}</span>
        </div>
        <Button variant="outline" size="sm" onClick={initializeGame} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.uniqueId}
            className="perspective-1000"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`relative w-20 h-24 cursor-pointer transition-all duration-500 preserve-3d ${
                card.isFlipped || card.isMatched ? "rotate-y-180" : ""
              }`}
              onClick={() => handleCardClick(index)}
            >
              {/* Front of card (Icon side) */}
              <div className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center bg-primary/10 rounded-xl border-2 border-primary/20 rotate-y-180">
                <card.Icon className="h-8 w-8 text-primary" />
              </div>

              {/* Back of card (Hidden side) */}
              <div className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center bg-card rounded-xl border-2 border-primary/10 hover:border-primary/30 shadow-sm">
                <Brain className="h-8 w-8 text-primary/20" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {matches === icons.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-4 p-6 bg-primary/10 rounded-2xl border border-primary/20"
          >
            <h3 className="text-xl font-bold text-primary mb-2">Well Done!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You found all pairs in {attempts} attempts.
            </p>
            <Button onClick={initializeGame}>Play Again</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}
