package com.grandmaster.chess

import org.junit.Assert.*
import org.junit.Test

class DailyCycleTest {

    private fun generateShuffledOrder(cycle: Int, seedOffset: Int, forbiddenFirst: Int?): List<Int> {
        val list = (0 until 1000).toMutableList()
        var s = ((cycle * 7919 + seedOffset) xor 0x5deece66).toLong()
        fun nextRand(): Float {
            s = (s * 1664525L + 1013904223L) and 0xffffffffL
            return (s.toDouble() / 4294967296.0).toFloat()
        }

        for (i in 999 downTo 1) {
            val j = (nextRand() * (i + 1)).toInt()
            val temp = list[i]
            list[i] = list[j]
            list[j] = temp
        }

        if (forbiddenFirst != null && list[0] == forbiddenFirst) {
            val t = list[0]
            list[0] = list[1]
            list[1] = t
        }
        return list
    }

    @Test
    fun testAll1000PuzzlesUsedExactlyOncePerCycle() {
        val cycle1 = generateShuffledOrder(1, 101, null)
        assertEquals(1000, cycle1.size)
        // Verify no duplicates
        val uniqueSet = cycle1.toSet()
        assertEquals(1000, uniqueSet.size)
        // Verify all 0..999 are present
        for (i in 0 until 1000) {
            assertTrue("Expected puzzle index $i in cycle", uniqueSet.contains(i))
        }
    }

    @Test
    fun testNewCycleDoesNotStartWithPreviousCycleEnd() {
        val cycle1 = generateShuffledOrder(1, 101, null)
        val lastOfCycle1 = cycle1[999]

        val cycle2 = generateShuffledOrder(2, 101, lastOfCycle1)
        assertNotEquals("First puzzle of cycle 2 must not equal final puzzle of cycle 1", lastOfCycle1, cycle2[0])
    }

    @Test
    fun testDifferentDifficultiesHaveIndependentSequences() {
        val easy = generateShuffledOrder(1, 101, null)
        val medium = generateShuffledOrder(1, 202, null)
        val hard = generateShuffledOrder(1, 303, null)

        // Verify they are distinct sequences
        assertNotEquals(easy[0], medium[0])
        assertNotEquals(medium[0], hard[0])
    }
}
