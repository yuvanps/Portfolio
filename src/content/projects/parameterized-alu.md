---
slug: parameterized-alu
summary: A registered 10-bit ALU in Verilog-2001, verified with a self-checking testbench, formal equivalence and mutation testing, then synthesized with Yosys to compare two adder designs.
---

## Overview

A parameterized ALU (10-bit by default) written strictly in Verilog-2001. It
supports 23 operations: add, subtract, increment, decrement, negate, signed
and unsigned compare, seven bitwise operations, shifts, rotates and data
moves. Each result comes with carry, signed overflow, zero, negative and
illegal-opcode flags. The goal was correct, measurable hardware rather than a
long feature list: every flag is specified per operation before it is built,
and every claim is backed by a log.

## Implementation

Inputs feed three combinational units (arithmetic, logic, shifter) that all
compute in parallel. A multiplexer driven by the top two opcode bits picks one
result, and 15 flip-flops capture it on the next clock edge: one cycle of
latency and one transaction per cycle, with a `valid_in`/`valid_out`
handshake and a synchronous active-low reset.

| Unit | How it works |
| --- | --- |
| Arithmetic | One shared adder for ADD, SUB, INC, DEC and NEG, using A − B = A + ~B + 1 |
| Compare | SLT uses the sign of A − B corrected by overflow, so −512 < 1 is still true when the subtraction wraps |
| Rotate | Rotation by B mod 10 without a divider: stage *k* rotates by the constant 2^k mod 10 |
| Adder | A `USE_RCA` parameter swaps the behavioral `+` for a structural ripple-carry adder; nothing else changes |

## Testing and validation

- **Self-checking testbench.** An independent reference model, using integer
  arithmetic and bit-by-bit loops rather than the RTL's logic, predicts every
  output. A scoreboard compares all seven outputs on every clock cycle,
  including idle and reset cycles.
- **Stimulus.** Directed tests of every opcode against corner values,
  hand-written golden vectors, interface tests, and 20,000 cycles of
  constrained-random stimulus with random gaps and resets. It runs at widths
  8, 10 and 16 for both adder designs.
- **Exhaustive and formal.** The ripple-carry adder was checked against all
  2,097,152 input combinations. Yosys proved the behavioral and structural
  ALUs equivalent with SAT-based induction.
- **Mutation testing.** Eleven realistic bugs (inverted carry, an unsigned
  arithmetic shift, a broken full adder and others) were injected into copies
  of the RTL. The testbench caught all of them.
- **Language check.** Verilator lint in Verilog-2001 mode plus a token scan,
  because Icarus in `-g2001` mode was found to accept some SystemVerilog.

## Results and limitations

The same RTL was synthesized with Yosys 0.33 in generic, iCE40 and Xilinx
flows, changing only `USE_RCA`. On its own, the ripple-carry adder used 24%
fewer gates (50 vs 66) but had 75% more logic depth (21 vs 12 cells), the
classic area-versus-speed trade-off. On iCE40, the behavioral `+` mapped onto
the dedicated carry chain (10 LUTs + 10 carry cells), while the hand-built
adder needed 23 plain LUTs. Across the whole ALU the difference was about 2%,
because the shifter accounts for 44% of the logic.

These are cell counts before place-and-route. No timing analysis or hardware
test was run, so no speed claims are made.

## Future improvements

- Share one barrel shifter for the three shift operations, the largest unit.
- Add a carry-lookahead adder and sweep the data width.
- Measure real timing with nextpnr.
