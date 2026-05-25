import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { createSignal, onMount, onCleanup } from "solid-js";
import { db } from "./firebase";

export interface Plan {
    id: string;
    items: string;
    coins: number;
    price: number;
    createdAt?: Timestamp;
}

export function usePlans() {
    const [plans, setPlans] = createSignal<Plan[]>([]);
    const [loading, setLoading] = createSignal(true);

    onMount(() => {
        const q = query(collection(db, "plan"), orderBy("price", "asc"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const plansList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Plan[];
                setPlans(plansList);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching plans:", error);
                setLoading(false);
            }
        );

        onCleanup(() => unsubscribe());
    });

    return { plans, loading };
}

export async function addPlan(plan: Omit<Plan, "id" | "createdAt">) {
    try {
        await addDoc(collection(db, "plan"), {
            ...plan,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding plan:", error);
        throw error;
    }
}

export async function updatePlan(id: string, plan: Partial<Plan>) {
    try {
        const planRef = doc(db, "plan", id);
        await updateDoc(planRef, plan);
    } catch (error) {
        console.error("Error updating plan:", error);
        throw error;
    }
}

export async function deletePlan(id: string) {
    try {
        await deleteDoc(doc(db, "plan", id));
    } catch (error) {
        console.error("Error deleting plan:", error);
        throw error;
    }
}
