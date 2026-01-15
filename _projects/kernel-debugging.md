---
layout: page
title: Linux Kernel Debugging & Profiling
description: Investigating kernel-level performance and blocking behavior using tracing and profiling tools.
img: 
importance: 1
category: work
date: 2025-10-01
related_publications: flase
---
 

### Context and Motivation
Understanding how programs behave at runtime requires more than reading source code or reasoning about APIs. I started this work while learning to debug user-space processes on Linux, using tools such as ```ps```, ```strace```, ```ltrace```, and ```gdb``` to inspect execution flow, system call interactions, and stack behavior. This exposed the gap between expected behavior and what actually happens when a process runs.

To go beyond surface-level debugging, I then extended this investigation into kernel space. The motivation was to understand how the operating system executes, schedules, and blocks processes beneath user-visible abstractions. By exploring kernel sources and internal instrumentation, I aimed to observe real execution paths, performance bottlenecks, and blocking conditions that are invisible from user space alone.

This project was driven by the desire to connect theory with reality: not just what the system should do, but how and why it behaves the way it does under real workloads.


### Technical Approach
The work followed a progressive approach, starting from user space and extending into kernel space, in order to understand system behavior across abstraction layers rather than treating the kernel as a black box.

I began in user space by observing running processes and their interactions with the operating system. Tools such as ```ps``` and ```/proc``` were used to identify anomalous behavior, including processes consuming excessive CPU time. I then employed ```strace``` and ```ltrace``` to distinguish system calls from library-level function calls, allowing me to quantify syscall usage and understand how user-space tools query kernel state through interfaces such as ```/proc```.

To analyze control flow and memory behavior, I relied on ```gdb``` with debug symbols enabled. This made it possible to inspect stack frames, diagnose segmentation faults caused by stack overflows, and attach to a running process exhibiting an infinite loop. By navigating stack frames and modifying variables directly in memory, I was able to alter program behavior at runtime without recompilation, highlighting the power and risks of low-level debugging.

After establishing visibility in user space, I extended the analysis into kernel space to observe execution beyond system call boundaries. I navigated kernel source code using ```cscope``` to locate core structures such as ```task_struct``` and trace the path of system calls through the VFS and filesystem layers. Dynamic Debug was used to activate kernel logs at runtime, while ```ftrace``` allowed precise tracing of function execution for a misbehaving process.

To complement tracing, I used ```perf``` to profile CPU usage and identify dominant execution paths, revealing filesystem-specific behavior (e.g., XFS) and syscall hotspots. Finally, I employed ```crash``` to inspect kernel memory and analyze blocked processes, using call stack inspection to determine that processes in an uninterruptible state were waiting on NFS I/O operations.

This layered approach-combining observation, tracing, profiling, and memory inspection-made it possible to connect high-level symptoms to low-level kernel mechanisms and understand how real workloads are executed and blocked within the operating system.


### Debugging and Analysis
The debugging work focused on identifying abnormal runtime behavior and tracing it back to concrete execution states rather than relying on assumptions about the code. A first recurring pattern was the presence of user-space processes consuming significant CPU time over long periods, indicating potential infinite loops or blocking behavior.

In one case, a process named ```crazy``` exhibited sustained CPU usage with no visible progress. Attaching a debugger to the running process revealed that execution was trapped in a loop controlled by a local variable whose value never changed. By inspecting the call stack and local variables at runtime, I identified the precise condition maintaining the loop. Modifying the variable directly in memory immediately altered the program’s behavior and allowed it to terminate cleanly, confirming the diagnosis without recompilation or restart.

Beyond individual processes, syscall-level analysis provided a broader view of system behavior. By aggregating syscall statistics, it became clear that filesystem-related calls such as ```open```, ```read```, and ```close``` dominated execution time for standard utilities. This observation reinforced the role of the virtual filesystem and ```/proc``` as critical interfaces between user-space tools and kernel data structures, and explained why seemingly simple commands can generate thousands of kernel interactions.

In kernel space, analysis shifted toward understanding blocked execution. Processes observed in an uninterruptible state were inspected through kernel memory analysis, revealing that they were waiting on I/O operations rather than actively executing. Call stack inspection showed that these processes were blocked in filesystem paths associated with network-backed storage, explaining both their state and their resistance to standard interruption signals.

Across both user space and kernel space, the debugging process relied on correlating symptoms (CPU usage, process state, lack of progress) with concrete execution contexts (stack frames, syscalls, kernel call paths). This made it possible to move from surface-level observations to precise explanations of why processes were running, looping, or blocked.


### Tools and Instrumentation
The investigation relied on a small set of complementary tools, each chosen to provide visibility at a specific level of the system rather than overlapping functionality.

At the user-space level, ```ps``` and the ```/proc``` filesystem were used to observe process state, CPU consumption, and runtime characteristics. ```strace``` and ```ltrace``` were then employed to distinguish interactions crossing the user–kernel boundary from those occurring within shared libraries, making it possible to reason about syscall frequency, dominant execution paths, and the cost of filesystem access.

For control-flow and memory inspection, ```gdb``` was the primary tool. Compiling programs with debug symbols enabled precise inspection of stack frames, local variables, and execution state. Attaching to live processes allowed runtime diagnosis of infinite loops and made it possible to validate hypotheses by modifying program state directly in memory.

In kernel space, static and dynamic instrumentation were combined. ```cscope``` was used to navigate kernel source code and understand the execution path of system calls beyond their user-space entry points. Dynamic Debug enabled selective kernel logging without recompilation, while ```ftrace``` provided fine-grained tracing of function execution to observe kernel behavior in response to specific workloads.

To analyze performance and blocking behavior, ```perf``` was used to identify CPU hotspots and dominant kernel functions, and ```crash``` was employed to inspect kernel memory and call stacks for processes in blocked states. Together, these tools enabled correlation between high-level symptoms and low-level kernel mechanisms.


### Challenges and Limitations
A recurring challenge throughout the work was that many runtime issues are difficult to observe at the exact moment they occur. In user space, highly active processes could not always be interrupted at a precise syscall boundary, requiring manual interruption and careful navigation of stack frames to reconstruct execution context after the fact.

Some tools also produced large volumes of data, making raw output impractical to analyze directly. For example, utilities operating on many processes or file descriptors generated verbose traces that obscured relevant information. This required selective filtering and a focus on specific processes or execution paths to keep analysis tractable.

In kernel space, visibility was inherently constrained by the complexity of the execution environment. Tracing and profiling exposed function-level behavior, but interpreting results required cross-referencing multiple sources, including kernel source code and call stacks. Additionally, blocked processes could only be understood indirectly through memory inspection and call path analysis, rather than through direct observation of progress.

Finally, the analysis was limited to controlled workloads and debugging scenarios. While the tools provided strong insight into execution behavior, conclusions drawn from these experiments may not generalize directly to all production environments, particularly under different filesystem configurations or I/O workloads.


### Key Learnings
One of the main takeaways from this work is that understanding program behavior requires observing execution as it actually happens, not as it is intended to happen. Source code alone is insufficient to explain runtime behavior without visibility into stack state, memory layout, and system interactions.

The boundary between user space and kernel space emerged as a central concept. Tools such as ```/proc```, system calls, and tracing mechanisms are not implementation details but core interfaces through which user-space programs interrogate kernel state. Even simple commands can trigger thousands of kernel interactions, making performance and behavior inherently tied to filesystem and kernel design.

Another important insight was the practical power of live debugging. Attaching to a running process, inspecting its state, and modifying memory at runtime demonstrated that debugging is not only a post-crash activity but also a dynamic investigative process. This capability is powerful, but it also requires caution, as it bypasses many safety guarantees.

In kernel space, the work highlighted how blocking and performance issues often originate far from where symptoms appear. Processes that seem inactive or unresponsive may be correctly waiting on I/O, and understanding this requires correlating process state, call stacks, and kernel execution paths rather than relying on surface-level indicators.

Finally, this project reinforced the idea that effective debugging is less about mastering individual tools and more about developing a layered mental model of system execution, from high-level symptoms down to low-level mechanisms.


### What I Would Do Differently
With more time, I would extend this work to larger and more diverse workloads in order to evaluate how the observed behaviors scale under sustained pressure. In particular, comparing local filesystems with different network-backed configurations would provide deeper insight into blocking behavior and performance variability.

I would also automate parts of the analysis pipeline to reduce reliance on manual inspection. Aggregating syscall statistics, trace outputs, and profiling data across multiple runs would make it easier to identify recurring patterns and eliminate bias introduced by single observations.

Finally, I would complement debugging and tracing with controlled fault injection, deliberately introducing delays or failures to observe how processes and the kernel respond. This would help move from reactive debugging toward a more systematic exploration of system robustness.