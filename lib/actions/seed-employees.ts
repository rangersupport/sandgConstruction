"use server"

import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "@/lib/supabase/config"

export async function seedRealEmployees() {
  if (!supabaseConfig.serviceRoleKey) {
    return { success: false, error: "Service role key not configured" }
  }

  // Create admin client with service role to bypass RLS
  const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // First, delete all existing employees
    const { error: deleteError } = await supabase
      .from("employees")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all

    if (deleteError) {
      console.error("[v0] Error deleting employees:", deleteError)
      return { success: false, error: `Failed to clear existing employees: ${deleteError.message}` }
    }

    // Real employee data from PDF
    const employees = [
      { name: "Alex Oswaldo Castaneda Molina", phone: "786-776-7872", hourly_rate: 20.0, role: "worker" },
      { name: "Alexy Edgardo Antunez Chinchilla", phone: "305-323-0874", hourly_rate: 20.0, role: "worker" },
      { name: "Alian Naranjo Ramirez", phone: "305-930-5046", hourly_rate: 20.0, role: "worker" },
      { name: "Andres Acosta Acosta", phone: "786-865-5800", hourly_rate: 20.0, role: "worker" },
      { name: "Angelo Rayo Torrez", phone: "786-407-3725", hourly_rate: 20.0, role: "worker" },
      { name: "Bayron Josue Maldonado Carcamo", phone: "786-671-9968", hourly_rate: 20.0, role: "worker" },
      { name: "Darwin Noe Castro Cruz", phone: "256-691-8652", hourly_rate: 20.0, role: "worker" },
      { name: "Erick Martinez", phone: "786-366-2976", hourly_rate: 20.0, role: "worker" },
      { name: "Jose Alonso Diaz Martinez", phone: "786-958-3797", hourly_rate: 20.0, role: "worker" },
      { name: "Jose Gregorio Mundarain", phone: "786-426-6497", hourly_rate: 20.0, role: "worker" },
      { name: "Jose Manuel Diaz Contreras", phone: "786-524-8808", hourly_rate: 20.0, role: "worker" },
      { name: "Jose Roberto Meneses Jiron", phone: "786-370-4027", hourly_rate: 20.0, role: "worker" },
      { name: "Mario Melendez", phone: "786-597-4007", hourly_rate: 20.0, role: "worker" },
      { name: "Miguel Angel Miranda", phone: "786-444-5079", hourly_rate: 20.0, role: "worker" },
      { name: "Luis Diego Ruiz Sanchez", phone: "770-902-2734", hourly_rate: 20.0, role: "worker" },
      { name: "Oswaldo L. Muñoz", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Raul Diaz Morel", phone: "786-445-4042", hourly_rate: 20.0, role: "worker" },
      { name: "Roberto Carranza Carranza", phone: "786-303-9176", hourly_rate: 20.0, role: "supervisor" },
      { name: "Santos Jimenez", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Wilder Quiñones Matos", phone: "856-882-0985", hourly_rate: 20.0, role: "worker" },
      { name: "Winston A. Baldelomar Alegria", phone: "786-564-6014", hourly_rate: 20.0, role: "worker" },
      { name: "Wiston Bermudez", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Yader Antonio Mejias", phone: "786-203-7105", hourly_rate: 20.0, role: "worker" },
      { name: "Yunior Alexander Diaz Castro", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Yusmanys Beritan Espinoza", phone: "561-480-0112", hourly_rate: 20.0, role: "worker" },
      { name: "Alexis Antonio", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Bayron Enrique Rosales Cruz", phone: "786-4451963", hourly_rate: 20.0, role: "worker" },
      { name: "Carlos Arnulfo Hernandez Flores", phone: "309-9731486", hourly_rate: 20.0, role: "supervisor" },
      { name: "Esteban Zamora", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Georvis de la Torre Sanchez", phone: "754-284-9219", hourly_rate: 20.0, role: "worker" },
      { name: "Kevin Edgardo Hernandez Flores", phone: "847-7662484", hourly_rate: 20.0, role: "worker" },
      { name: "Wiston Bermudez", phone: "305-391-7779", hourly_rate: 20.0, role: "worker" },
      { name: "Yeison C. Bermudez", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Bayardo V. Obregon Urbina", phone: "786-704-2233", hourly_rate: 20.0, role: "worker" },
      { name: "Brayan Antonio Urroz Saravia", phone: "786-828-3203", hourly_rate: 20.0, role: "worker" },
      { name: "Carlos Arturo Campo", phone: "786-382-3711", hourly_rate: 20.0, role: "worker" },
      { name: "Cairo Danilo Toruno Pineda", phone: "786-754-0759", hourly_rate: 20.0, role: "worker" },
      { name: "Dafri Eduardo Chavarria Lopez", phone: "480-430-5682", hourly_rate: 20.0, role: "worker" },
      { name: "Dorvin Armando Reyes Cruz", phone: "786-914-9636", hourly_rate: 20.0, role: "worker" },
      { name: "Edgar Alberto Trejo Andrade", phone: "786-486-7915", hourly_rate: 20.0, role: "worker" },
      { name: "Eduin Jose Baca Canales", phone: "815-372-8776", hourly_rate: 20.0, role: "worker" },
      { name: "Elmer Antonio Sanchez Martinez", phone: "305-793-3531", hourly_rate: 20.0, role: "worker" },
      { name: "Fernando Javier Sagastume Urquia", phone: "305-384-0236", hourly_rate: 20.0, role: "worker" },
      { name: "Gilberto Oval", phone: "786-390-8634", hourly_rate: 20.0, role: "supervisor" },
      { name: "Jesus Antonio Cubias Sanchez", phone: "239-645-3126", hourly_rate: 20.0, role: "worker" },
      { name: "Jonhson A. Ascanio Monsalve", phone: "786-762-5794", hourly_rate: 20.0, role: "worker" },
      { name: "Jose Antonio Gomez", phone: "669-239-1867", hourly_rate: 20.0, role: "worker" },
      { name: "Mario Jose Guzman", phone: "864-247-1585", hourly_rate: 20.0, role: "worker" },
      { name: "Marvin Gabriel Estrada Maradiaga", phone: "605-920-3200", hourly_rate: 20.0, role: "worker" },
      { name: "Marvin Noe Mencias Chirinos", phone: "786-641-4251", hourly_rate: 20.0, role: "worker" },
      { name: "Norlan Antonio Muñoz Gaitan", phone: "786-635-2585", hourly_rate: 20.0, role: "worker" },
      { name: "Osmar Lagos Tercero", phone: "305-766-8125", hourly_rate: 20.0, role: "worker" },
      { name: "Osmen Eli Medrano Medrano", phone: "305-413-6343", hourly_rate: 20.0, role: "worker" },
      { name: "Ronal Alexander Marroquin Sanchez", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Rony Alberto Ruiz Escobar", phone: "786-764-2092", hourly_rate: 20.0, role: "worker" },
      { name: "Rudys Moises Lopez Quiroz", phone: "786-447-1262", hourly_rate: 20.0, role: "worker" },
      { name: "Aniel Youyoute", phone: "786-725-1931", hourly_rate: 20.0, role: "worker" },
      { name: "Edixon Sanchez", phone: "754-299-8710", hourly_rate: 20.0, role: "worker" },
      { name: "Esteban Garcia Campos", phone: "305-975-9827", hourly_rate: 20.0, role: "worker" },
      { name: "Evener Ruiz", phone: "786-762-6809", hourly_rate: 20.0, role: "worker" },
      { name: "Gerardo Lino Guillen Tarrero", phone: "786-778-9448", hourly_rate: 20.0, role: "worker" },
      { name: "Herminio Rodriguez Cifuentes", phone: "786-356-1205", hourly_rate: 20.0, role: "worker" },
      { name: "Jose Alexander Saavedra", phone: "786-794-8911", hourly_rate: 20.0, role: "worker" },
      { name: "Jose Carlos Ortiz Hernandez", phone: "786-374-5830", hourly_rate: 20.0, role: "worker" },
      { name: "Jose Luis Perez Antunez", phone: "305-481-7765", hourly_rate: 20.0, role: "worker" },
      { name: "Manuel D. Mendez Sanchez", phone: "786-938-4380", hourly_rate: 20.0, role: "worker" },
      { name: "Manuel de Jesus Mendez Matamoros", phone: "786-754-0757", hourly_rate: 20.0, role: "worker" },
      { name: "Marco Tulio Galicia Ramos", phone: "786-300-6752", hourly_rate: 20.0, role: "worker" },
      { name: "Marcos Felipe Ramos Disla", phone: "786-598-9719", hourly_rate: 20.0, role: "worker" },
      { name: "Nestor Xavier Palacios Duarte", phone: "786-304-5572", hourly_rate: 20.0, role: "worker" },
      { name: "Orlando de Jesus Oviedo Alvarado", phone: "786-537-7422", hourly_rate: 20.0, role: "worker" },
      { name: "Osmin Neptali Ortiz Funes", phone: "786-380-5026", hourly_rate: 20.0, role: "supervisor" },
      { name: "Raul Carmona Delgado", phone: "305-834-1963", hourly_rate: 20.0, role: "worker" },
      { name: "William Jose Ruiz Castro", phone: "786-762-6809", hourly_rate: 20.0, role: "worker" },
      { name: "Yoandy Lantigua Lopez", phone: "786-602-7704", hourly_rate: 20.0, role: "worker" },
      { name: "Yosnier Peraza Gonzalez", phone: "786-809-7071", hourly_rate: 20.0, role: "worker" },
      { name: "Antonio Jose Canelones Omana", phone: "786-627-3911", hourly_rate: 20.0, role: "worker" },
      { name: "Cesar Amady Geoson Mejia", phone: "786-826-4334", hourly_rate: 20.0, role: "worker" },
      { name: "Cesar Berardo Trochez", phone: "786-260-1995", hourly_rate: 20.0, role: "worker" },
      { name: "Eslier Mauricio Martinez Jimenez", phone: "786-355-5429", hourly_rate: 20.0, role: "worker" },
      { name: "Franklin David Guerrero Berroa", phone: "305-522-3813", hourly_rate: 20.0, role: "worker" },
      { name: "Jose Gabriel Novoa Osorio", phone: "928-287-4788", hourly_rate: 20.0, role: "supervisor" },
      { name: "Josue Nahum Calix Montenegro", phone: "786-378-3914", hourly_rate: 20.0, role: "worker" },
      { name: "Josue Osmin Rodriguez Caballero", phone: "786-531-8947", hourly_rate: 20.0, role: "worker" },
      { name: "Kedyn D. Rivera Ramos", phone: "786-803-6465", hourly_rate: 20.0, role: "worker" },
      { name: "Olban Joel Cruz Ventura", phone: "786-424-9219", hourly_rate: 20.0, role: "worker" },
      { name: "Oscar Danilo Rivas Quiroz", phone: "253-881-9771", hourly_rate: 20.0, role: "worker" },
      { name: "Wilmer Marcelino de Jesus Ramirez", phone: "786-914-0697", hourly_rate: 20.0, role: "worker" },
      { name: "David Ros Cardona", phone: "561-401-5486", hourly_rate: 20.0, role: "worker" },
      { name: "Efrain de Jesús Gomez Diaz", phone: "305-775-2453", hourly_rate: 20.0, role: "worker" },
      { name: "Esteban Alexander Ros Galdamez", phone: "561-262-1811", hourly_rate: 20.0, role: "worker" },
      { name: "Fredy Victor Quiñones Diaz", phone: "561-941-1442", hourly_rate: 20.0, role: "worker" },
      { name: "Jaime Victor Adrian Quiñones Diaz", phone: "561-805-0083", hourly_rate: 20.0, role: "worker" },
      { name: "Newton Miguel Garcia", phone: "786-419-3473", hourly_rate: 20.0, role: "supervisor" },
      { name: "Jose Alirio Turcios Cruz", phone: "786-712-6158", hourly_rate: 20.0, role: "supervisor" },
      { name: "Nery David Apen Cortez", phone: "786-340-3567", hourly_rate: 20.0, role: "worker" },
      { name: "Reynier Colas Puente", phone: "754-275-2843", hourly_rate: 20.0, role: "worker" },
      { name: "Aurelio Rufino Rangel", phone: "305-684-7069", hourly_rate: 20.0, role: "worker" },
      { name: "Wilfredo Reyes", phone: "786-420-7908", hourly_rate: 20.0, role: "worker" },
      { name: "Dilmer Adelson Ortiz Lopez", phone: "786-873-8876", hourly_rate: 20.0, role: "supervisor" },
      { name: "Edgar Leonel Guaran", phone: "508-840-1029", hourly_rate: 20.0, role: "worker" },
      { name: "Alex Gabriel Mencias", phone: "954-270-9252", hourly_rate: 20.0, role: "worker" },
      { name: "Carlos Enrique Rosales Almendares", phone: "786-873-8876", hourly_rate: 20.0, role: "worker" },
      { name: "Criss Hernandez", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Manuel Zapata", phone: "786-454-6656", hourly_rate: 20.0, role: "worker" },
      { name: "Omar Acevedo", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Oscar David Aguillon Juarez", phone: "305-586-4703", hourly_rate: 20.0, role: "worker" },
      { name: "Oscar Giovanni Rosales Antunez", phone: "786-576-8614", hourly_rate: 20.0, role: "worker" },
      { name: "Oswaldo Javier Mendoza Salas", phone: "254-319-5831", hourly_rate: 20.0, role: "supervisor" },
      { name: "Pedro Esteban Montero", phone: "", hourly_rate: 20.0, role: "worker" },
      { name: "Byron Apen Cortez", phone: "239-265-0556", hourly_rate: 20.0, role: "supervisor" },
      { name: "Jacob Bedoya", phone: "786-304-4364", hourly_rate: 20.0, role: "worker" },
      { name: "Javier Alejandro Gonzalez", phone: "786-346-7729", hourly_rate: 20.0, role: "worker" },
      { name: "Jesus Martinez", phone: "787-974-3894", hourly_rate: 20.0, role: "worker" },
      { name: "Josue Israel Rodriguez Euceda", phone: "305-781-2813", hourly_rate: 20.0, role: "worker" },
      { name: "Ramon Enrique Bastidas Vielma", phone: "786-603-8021", hourly_rate: 20.0, role: "worker" },
    ]

    // Insert employees with employee numbers and default PIN
    const employeesToInsert = employees.map((emp, index) => ({
      employee_number: (1001 + index).toString(),
      name: emp.name,
      phone: emp.phone || null,
      email: null,
      role: emp.role,
      hourly_rate: emp.hourly_rate,
      overtime_rate: emp.hourly_rate * 1.5,
      status: "active",
      pin_hash: "$2a$10$rQYz8vZ8Z8Z8Z8Z8Z8Z8ZuKx8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8", // Will be set properly via set_employee_pin
      must_change_pin: true,
      failed_login_attempts: 0,
      locked_until: null,
    }))

    const { data, error: insertError } = await supabase.from("employees").insert(employeesToInsert).select()

    if (insertError) {
      console.error("[v0] Error inserting employees:", insertError)
      return { success: false, error: `Failed to insert employees: ${insertError.message}` }
    }

    console.log(`[v0] Successfully inserted ${data?.length || 0} employees`)

    // Now set the PIN for all employees using the database function
    for (let i = 0; i < employees.length; i++) {
      const employeeNumber = (1001 + i).toString()
      const { error: pinError } = await supabase.rpc("set_employee_pin", {
        p_employee_number: employeeNumber,
        p_new_pin: "1234",
      })

      if (pinError) {
        console.error(`[v0] Error setting PIN for employee ${employeeNumber}:`, pinError)
      }
    }

    return {
      success: true,
      message: `Successfully seeded ${employees.length} employees with default PIN 1234`,
    }
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
